namespace Backend.Models
{
    public class SavedListing
    {
        public int Id { get; set; }
        public Guid ListingId { get; set; }
        public Guid UserId { get; set; }
    }
}
