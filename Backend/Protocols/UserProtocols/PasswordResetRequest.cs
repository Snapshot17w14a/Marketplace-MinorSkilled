namespace Backend.Protocols.UserProtocols
{
    public class PasswordResetRequest
    {
        public Guid Token { get; set; }
        public string Password { get; set; } = null!;
    }
}
