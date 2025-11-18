namespace Backend.Models
{
    public class UserRole
    {
        public required string Role { get; set; }
        public required ICollection<PermissionClaim> Permissions { get; set; }
    }
}
