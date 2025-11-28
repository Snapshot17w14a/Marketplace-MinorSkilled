namespace Backend.Protocols.UserProtocols
{
    public class MFALoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Totp { get; set; }
    }
}
