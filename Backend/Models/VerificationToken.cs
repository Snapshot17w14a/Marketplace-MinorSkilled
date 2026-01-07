namespace Backend.Models
{
    public class VerificationToken
    {
        public int Id { get; set; }
        public required Guid UserId { get; set; }
        public required string Token { get; set; }
    }
}
