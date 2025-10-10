namespace Backend.Protocols.UserProtocols
{
    public class CreateUserRequest
    {
        public required string Email { get; set; } = null!;
        public required string Password { get; set; } = null!;
        public required string Username { get; set; } = null!;
    }
}
