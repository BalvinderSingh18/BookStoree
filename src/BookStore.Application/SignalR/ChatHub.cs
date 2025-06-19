using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace BookStore.SignalR
{
    [Authorize]
    public class ChatHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"✅ Connected: {Context.UserIdentifier} (Conn: {Context.ConnectionId})");
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"❌ Disconnected: {Context.UserIdentifier} (Conn: {Context.ConnectionId})");
            return base.OnDisconnectedAsync(exception);
        }

        // 📩 Send private message
        public async Task SendMessageToUser(string receiverId, string message, string messageId)
        {
            var senderId = Context.UserIdentifier;
            await Clients.User(receiverId).SendAsync("ReceiveMessage", senderId, message, messageId);
            await Clients.User(senderId).SendAsync("MessageSent", receiverId, message, messageId);
        }

        // 👁️ Mark message as seen
        public async Task SeenMessage(string messageId)
        {
            var senderId = Context.UserIdentifier;
            await Clients.All.SendAsync("MessageSeen", messageId, senderId);
        }

        // 📢 Broadcast message
        public async Task SendMessageToAll(string message)
        {
            var senderId = Context.UserIdentifier;
            await Clients.All.SendAsync("ReceiveMessage", senderId, message, Guid.NewGuid().ToString());
        }

        // 📞 Initiate a call
        public async Task CallUser(string receiverId, string offer, string callType)
        {
            var senderId = Context.UserIdentifier;
            await Clients.User(receiverId).SendAsync("IncomingCall", senderId, offer, callType);
        }

        // ✅ Answer a call
        public async Task AnswerCall(string callerId, string answer)
        {
            var receiverId = Context.UserIdentifier;
            await Clients.User(callerId).SendAsync("CallAnswered", receiverId, answer);
        }

        // ❌ Reject or end a call
        public async Task EndCall(string otherUserId)
        {
            var senderId = Context.UserIdentifier;
            await Clients.User(otherUserId).SendAsync("CallEnded", senderId);
        }

        // 🔄 Exchange ICE candidates
        public async Task SendIceCandidate(string otherUserId, string candidate)
        {
            var senderId = Context.UserIdentifier;
            await Clients.User(otherUserId).SendAsync("IceCandidateReceived", senderId, candidate);
        }
    }
}
