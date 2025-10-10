using System.Security.Cryptography;
using System.Text;

namespace Backend.Services
{
    public class PasswordHashService
    {
        public string HashPassword(string inputString)
        {
            StringBuilder sb = new();
            foreach (byte b in SHA256.HashData(Encoding.UTF8.GetBytes(inputString)))
                sb.Append(b.ToString("X2"));

            return sb.ToString();
        }
    }
}
