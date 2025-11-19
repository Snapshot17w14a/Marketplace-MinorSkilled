using Backend.Roles;

namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid Identifier { get; set; } = Guid.NewGuid();
        public required string Role { get; set; } = IdentityRole.Member;
    }
}
