namespace Backend.Protocols.ListingProtocols
{
    public class EditListingRequest
    {
        public required Guid ListingGuid { get; set; }

        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? Price { get; set; }
        public string? Currency { get; set; }
        public Guid[] ImageGuids { get; set; } = [];
    }
}
