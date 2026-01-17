namespace Backend.Protocols.ChatProtocols
{
    public class SendMessageRequest
    {
        public int ConversationId { get; set; }
        public required string Content { get; set; }
    }
}
