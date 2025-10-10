namespace Backend.Protocols.ListingProtocols
{
    public class CreateListingRequest
    {
        public required Guid[] LinkedImages { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required int Price { get; set; }
        public required string Currency { get; set; }
    }
}
