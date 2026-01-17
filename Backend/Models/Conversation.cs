namespace Backend.Models
{
    public class Conversation
    {
        public int Id { get; set; }

        public Guid BuyerId { get; set; }
        public Guid SellerId { get; set; }
        public Guid ListingId { get; set; }
    }
}
