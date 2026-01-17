namespace Backend.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public required string Content { get; set; }
        public Guid SenderId { get; set; }
        public DateTime SentAt { get; set; }
    }
}
