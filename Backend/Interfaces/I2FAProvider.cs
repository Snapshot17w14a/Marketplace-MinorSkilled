namespace Backend.Interfaces
{
    public interface I2FAProvider
    {
        public string GetSecretKey(Guid userGuid, string email, string password);
        public bool ValidateOTP(string otp, string secret);
    }
}
