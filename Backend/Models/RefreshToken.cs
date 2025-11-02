using Microsoft.IdentityModel.Tokens;

namespace Backend.Models
{
    public class RefreshToken
    {
        public Guid TokenId { get; set; }
        public Guid UserId { get; set; }
        public DateTime Expiration { get; set; }

        public static RefreshToken DecodeTokenString(string token)
        {
            token = Base64UrlEncoder.Decode(token);
            var content = token.Split('.');

            return new()
            {
                TokenId = Guid.Parse(content[0]),
                UserId = Guid.Parse(content[1]),
                Expiration = DateTime.Parse(content[2])
            };
        }

        public override string ToString()
        {
            return string.Format("{0}.{1}.{2}", TokenId, UserId, Expiration);
        }
    }
}
