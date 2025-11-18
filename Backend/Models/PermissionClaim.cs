namespace Backend.Models
{
    public class PermissionClaim
    {
        public required string Role { get; set; }
        public required string Permission { get; set; }
    }
}
