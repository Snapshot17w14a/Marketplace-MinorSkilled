using Backend.Models;

namespace Backend.Protocols.DTOs
{
    public class ListingDTO(Listing listing, Guid? userId)
    {
        public Guid? UserId { get; } = userId;
        public Guid ListingId { get; } = listing.Guid;
        public string Title { get; } = listing.Title;
        public string Description { get; } = listing.Description;
        public string Currency { get; } = listing.Currency;
        public int Price { get; } = listing.Price;
        public DateTime CreatedAt { get; } = listing.CreatedAt;

        public ICollection<ListingImage> Images { get; } = listing.Images;
        public ICollection<ListingCategoryDTO> Categories { get; } = [.. listing.CategoryRelations.Select(cr => new ListingCategoryDTO(cr.Category))];
    }
}
