using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Backend.Models;
using Backend.Database;
using System.Text;
using System.Security.Cryptography;

namespace Backend.Services
{
    public class TokenService(ApplicationDbContext context, IConfiguration config)
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IConfiguration _config = config;

        public string GenerateJWToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var JWTSymKeySecret = _config.GetSection("Secrets")["JWTSymKeySecret"];
            if (string.IsNullOrEmpty(JWTSymKeySecret)) throw new Exception("JWTSymKeySecret was not found in configuration");
            var secretKey = Encoding.UTF8.GetBytes(JWTSymKeySecret);

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

        public async Task<string> GenerateVerificationToken(User user)
        {
            var content = Base64UrlEncoder.Encode(string.Format("{0},{1}", user.Identifier, user.Email));

            var token = new VerificationToken
            {
                UserId = user.Identifier,
                Token = content
            };

            _context.VerificationTokens.Add(token);
            await _context.SaveChangesAsync();

            return content;
        }
    }
}
