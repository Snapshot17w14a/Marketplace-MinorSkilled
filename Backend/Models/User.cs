using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class User : IdentityUser<Guid>
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
