using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Backend.Models;
using Backend.Database;

namespace Backend.Services
{
    public class JWTGeneratorService(ApplicationDbContext context)
    {
        private readonly ApplicationDbContext _context = context;

        public string GenerateJWToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = "VerySecretKeyForAuthenticationDontShareWithAnyone"u8.ToArray();

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(JwtRegisteredClaimNames.Sub, user.Identifier.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(60),
                Issuer = "https://api.mkev.dev",
                Audience = "https://marketplace.mkev.dev",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<string> GenerateRefreshToken(User user)
        {
            var token = new RefreshToken
            {
                TokenId = Guid.NewGuid(),
                UserId = user.Identifier,
                Expiration = DateTime.UtcNow.AddHours(24),
            };

            _context.RefreshTokens.Add(token);
            await _context.SaveChangesAsync();

            return Base64UrlEncoder.Encode(token.ToString());
        }
    }
}
