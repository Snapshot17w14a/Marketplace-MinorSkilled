namespace Backend.Protocols.ChatProtocols
{
    public class CreateCoversationRequest
    {
        public Guid ListingId { get; set; }
        public Guid ListingOwnerId { get; set; }
    }
}
