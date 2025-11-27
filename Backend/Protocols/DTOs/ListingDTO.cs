using Backend.Models;

namespace Backend.Protocols.DTOs
{
    public class ListingDTO(Listing listing, Guid userId)
    {
        public Guid UserId { get; private set; } = userId;
        public Guid ListingId { get; private set; } = listing.Guid;
        public string Title { get; private set; } = listing.Title;
        public string Description { get; private set; } = listing.Description;
        public string Currency { get; private set; } = listing.Currency;
        public int Price { get; private set; } = listing.Price;
        public DateTime CreatedAt { get; private set; } = listing.CreatedAt;

        public ICollection<ListingImage> Images { get; private set; } = listing.Images;
    }
}
