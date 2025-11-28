using System.Security.Cryptography;
using System.Text;
using Backend.Interfaces;
using OtpNet;

namespace Backend.Services
{
    public class OtpNET2FAProvider : I2FAProvider
    {
        public string GetSecretKey(Guid userGuid, string email, string password)
        {
            var enctiptData = SHA256.HashData(Encoding.UTF8.GetBytes(string.Format("{0}.{1}.{2}", userGuid, email, password)));

            return Base32Encoding.ToString(enctiptData)[..16];
        }

        public bool ValidateOTP(string otp, string secret)
        {
            var totp = new Totp(Base32Encoding.ToBytes(secret));

            return totp.VerifyTotp(otp, out _);
        }
    }
}
