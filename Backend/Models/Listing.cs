using Backend.Protocols.ListingProtocols;

namespace Backend.Models
{
    public class Listing
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public Guid Guid { get; set; } = Guid.NewGuid();
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required int Price { get; set; }
        public required string Currency { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ListingImage> Images { get; set; } = [];

        public void ApplyChanges(EditListingRequest request)
        {
            if (!string.IsNullOrEmpty(request.Title))
                this.Title = request.Title;

            if (!string.IsNullOrEmpty(request.Description))
                this.Description = request.Description;

            if (!string.IsNullOrEmpty(request.Currency))
                this.Currency = request.Currency;

            if (request.Price != null)
                this.Price = (int)request.Price;
        }
    }
}
