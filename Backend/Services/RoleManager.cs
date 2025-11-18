using Backend.Database;
using Backend.Models;

namespace Backend.Services
{
    public class RoleManager(ApplicationDbContext context)
    {
        private readonly ApplicationDbContext _context = context;

        private Dictionary<string, List<string>> rolePermissions = [];

        public void CreateRole(string role)
        {
            rolePermissions.Add(role, []);
        }

        public void AddPermission(string role, string permission)
        {
            rolePermissions[role].Add(permission);
        }

        public async Task WriteToDatabase()
        {
            foreach(var kvp in rolePermissions)
            {
                List<PermissionClaim> claims = [];

                foreach (var permission in kvp.Value)
                {
                    claims.Add(new PermissionClaim()
                    {
                        Permission = permission,
                        Role = kvp.Key,
                    });
                }

                var role = new UserRole()
                {
                    Role = kvp.Key,
                    Permissions = [.. claims]
                };

                await _context.UserRoles.AddAsync(role);
                await _context.PermissionClaims.AddRangeAsync(claims);
            }

            await _context.SaveChangesAsync();
        }
    }
}
