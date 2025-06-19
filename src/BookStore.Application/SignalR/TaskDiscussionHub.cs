using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace BookStore.SignalR
{
    public class TaskDiscussionHub : Hub
    {
        public async Task SendDiscussionUpdate(int taskId, string discussion)
        {
            await Clients.All.SendAsync("ReceiveDiscussionUpdate", taskId, discussion);
        }
    }
}
