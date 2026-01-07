namespace Backend.Protocols.UserProtocols
{
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? Totp { get; set; }
    }
}
