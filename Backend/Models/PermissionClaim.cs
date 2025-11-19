namespace Backend.Models
{
    public class PermissionClaim
    {
        public int Id { get; set; }
        public required string Role { get; set; }
        public required string Permission { get; set; }
    }
}
