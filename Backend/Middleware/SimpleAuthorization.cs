using System.IdentityModel.Tokens.Jwt;
using Backend.Database;
using Backend.Extensions;
using Backend.Roles;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Middleware
{
    public class SimpleAuthorization(RequestDelegate next, ILogger<SimpleAuthorization> logger)
    {
        private readonly RequestDelegate _next = next;
        private readonly ILogger _logger = logger;

        public async Task InvokeAsync(HttpContext context)
        {
            // Get the endpoint, if it does't exist, or it does and has the AllowAnonymous attribute, don't run auth logic
            var endpoint = context.GetEndpoint();
            if (endpoint == null || endpoint.Metadata.GetMetadata<AllowAnonymousAttribute>() != null)
            {
                await _next(context);
                return;
            }

            // Get the attributes to check later
            var roleReq = endpoint.Metadata.GetMetadata<RoleAttribute>();
            var permsReq = endpoint.Metadata.GetMetadata<PermissionAttribute>();

            // If none of the attributes exist don't run auth logic
            if (permsReq == null && roleReq == null)
            {
                await _next(context);
                return;
            }

            // Get the auth header from the request, check if its null
            var token = context.Request.Headers.Authorization.ToString();
            if (string.IsNullOrWhiteSpace(token))
            {
                await _next(context);
                return;
            }

            // Create a token handler and read the auth JWT, read the user id field "sub"
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(token[7..]);
            var subClaim = decodedToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

            if (string.IsNullOrEmpty(subClaim))
            {
                await _next(context);
                return;
            }

            // Get the database to fetch the user and role permissions
            var dbContext = context.RequestServices.GetRequiredService<ApplicationDbContext>();

            // Fetch the user with the id extracted from the JWT
            var user = await dbContext.Users.FromIdentifier(Guid.Parse(subClaim));
            if (user == null)
            {
                await _next(context);
                return;
            } 

            // Check the role requirements, if the attribute exists
            if (roleReq != null && user.Role != roleReq.Role)
            {
                _logger.LogInformation("User auth failed, role match");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            // Check the permission requirements, if the attribute exists
            if (permsReq != null)
            {
                var rolePerms = dbContext.PermissionClaims
                .Where(pc => pc.Role == user.Role)
                .ToList();

                if (!permsReq.RequiredPermissions.All(rp => rolePerms.Any(perm => perm.Permission == rp)))
                {
                    _logger.LogInformation("User auth failed, perms match");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return;
                }
            }

            // Auth passed, continue the middleware chain
            await _next(context);
        }
    }
}
