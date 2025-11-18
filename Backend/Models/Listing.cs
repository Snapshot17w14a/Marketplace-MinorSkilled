namespace Backend.Models
{
    public class Listing
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public Guid Guid { get; set; } = Guid.NewGuid();
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required int Price { get; set; }
        public required string Currency { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ListingImage> Images { get; set; } = [];
    }
}
