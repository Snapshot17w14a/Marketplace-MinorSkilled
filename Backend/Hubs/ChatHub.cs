using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    public interface IChatHubClient
    {
        public Task SendMessage(Message message);
    }

    [Authorize]
    public class ChatHub : Hub<IChatHubClient>
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;

            await base.OnConnectedAsync();
        }
    }
}
