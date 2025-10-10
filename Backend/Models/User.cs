namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Name { get; set; } = null!;
        public string? Email { get; set; } = null!;
        public string? Password { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Guid Identifier { get; set; } = Guid.NewGuid();
    }
}
