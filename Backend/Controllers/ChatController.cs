using Backend.Database;
using Backend.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Controllers
{
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class ChatController(ApplicationDbContext context, IHubContext<ChatHub, IChatHubClient> hubContext) : Controller
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IHubContext<ChatHub, IChatHubClient> _hubContext = hubContext;

        [HttpPost]
        public async Task<ActionResult> SendMessage()
        {
            await _hubContext.Clients.All.SendMessage("asdasdad");

            return NoContent();
        }
    }
}
