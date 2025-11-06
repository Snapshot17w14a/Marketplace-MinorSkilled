namespace Backend.Models
{
    public class PasswordResetToken
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public DateTime Expiration { get; set; }
        public Guid Token { get; set; }
    }
}
