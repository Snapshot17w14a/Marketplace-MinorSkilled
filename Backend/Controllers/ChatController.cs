using Backend.Database;
using Backend.Extensions;
using Backend.Hubs;
using Backend.Models;
using Backend.Protocols.ChatProtocols;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]/[Action]")]
    [ApiController]
    [Authorize]
    public class ChatController(ApplicationDbContext context, IHubContext<ChatHub, IChatHubClient> hubContext) : Controller
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IHubContext<ChatHub, IChatHubClient> _hubContext = hubContext;

        [HttpPost]
        public async Task<ActionResult> SendMessage(SendMessageRequest request)
        {
            var user = HttpContext.AuthenticatedUser();
            if (user is null)
                return NotFound();

            Conversation? conversation = await _context.Conversations.Where(c => c.Id == request.ConversationId).FirstOrDefaultAsync();
            if (conversation is null) return NotFound();

            Message message = new()
            {
                ConversationId = request.ConversationId,
                SentAt = DateTime.UtcNow,
                Content = request.Content,
                SenderId = user.Identifier
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            Guid targetId = conversation.SellerId == user.Identifier ? conversation.BuyerId : conversation.SellerId;

            await _hubContext.Clients.User(targetId.ToString()).SendMessage(message);

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult> CreateConversation(CreateCoversationRequest request)
        {
            User? user = HttpContext.AuthenticatedUser();
            if (user is null) return NotFound();

            Conversation? conversation = await _context.Conversations.Where(c => c.ListingId == request.ListingId && c.BuyerId == user.Identifier).FirstOrDefaultAsync();

            if (conversation is not null) return NoContent();

            conversation = new()
            {
                ListingId = request.ListingId,
                BuyerId = user.Identifier,
                SellerId = request.ListingOwnerId
            };

            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();

            return Created();
        }

        [HttpGet]
        public async Task<ActionResult> GetConversations()
        {
            User? user = HttpContext.AuthenticatedUser();
            if (user is null) return NotFound();

            var conversations = _context.Conversations.Where(c => c.BuyerId == user.Identifier || c.SellerId == user.Identifier);

            return Ok(conversations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetConversationMessages(int id)
        {
            var messages = _context.Messages.Where(m => m.ConversationId == id);

            if (messages is null) return NotFound();

            return Ok(messages);
        }
    }
}
