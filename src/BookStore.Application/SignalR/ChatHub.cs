using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
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
        // 📎 Send attachment (photo/pdf/video)
        public async Task SendAttachmentToUser(string receiverId, string fileUrl, string fileName, string fileType, string messageId)
        {
            var senderId = Context.UserIdentifier;

            Console.WriteLine($"📥 Received attachment info:");
            Console.WriteLine($"fileUrl: {fileUrl}");
            Console.WriteLine($"fileName: {fileName}");
            Console.WriteLine($"fileType: {fileType}");

            if (string.IsNullOrWhiteSpace(fileUrl) || string.IsNullOrWhiteSpace(fileName))
            {
                Console.WriteLine("❌ One or more parameters are null or empty.");
            }

            var attachment = new
            {
                Url = fileUrl,
                Name = fileName,
                Type = fileType,
                MessageId = messageId
            };

            await Clients.User(receiverId).SendAsync("ReceiveAttachment", senderId, fileUrl, fileName, fileType, messageId);
            await Clients.User(senderId).SendAsync("AttachmentSent", receiverId, fileUrl, fileName, fileType, messageId);
        }
        public async Task NotifyProfilePictureUpdated(string newUrl)
        {
            var userId = Context.UserIdentifier;
            await Clients.All.SendAsync("UserProfilePictureUpdated", userId, newUrl);
        }

        // Join a group
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"📥 {Context.UserIdentifier} joined group {groupName}");

            await Clients.Group(groupName).SendAsync("UserJoinedGroup", Context.UserIdentifier, groupName);
        }

        // Leave a group
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"📤 {Context.UserIdentifier} left group {groupName}");

            await Clients.Group(groupName).SendAsync("UserLeftGroup", Context.UserIdentifier, groupName);
        }
        public async Task SendGroupMessage(string groupName, string message, string messageId)
        {
            var senderId = Context.UserIdentifier;
            await Clients.Group(groupName).SendAsync("ReceiveGroupMessage", groupName, senderId, message, messageId);
        }
        public async Task SendGroupAttachment(string groupName, string fileUrl, string fileName, string fileType, string messageId)
        {
            var senderId = Context.UserIdentifier;

            var attachment = new
            {
                Url = fileUrl,
                Name = fileName,
                Type = fileType,
                MessageId = messageId
            };

            await Clients.Group(groupName).SendAsync("ReceiveGroupAttachment", groupName, senderId, fileUrl, fileName, fileType, messageId);
        }
        public async Task SeenGroupMessage(string groupName, string messageId)
        {
            var userId = Context.UserIdentifier;
            await Clients.Group(groupName).SendAsync("GroupMessageSeen", groupName, messageId, userId);
        }
        public async Task NotifyGroupProfilePictureUpdated(string groupName, string newUrl)
        {
            await Clients.Group(groupName).SendAsync("GroupProfilePictureUpdated", groupName, newUrl);
        }
        public static class ChatConnectionMapping
        {
            private static readonly Dictionary<string, HashSet<string>> _connections = new();

            public static void Add(string userId, string connectionId)
            {
                lock (_connections)
                {
                    if (!_connections.TryGetValue(userId, out var conns))
                    {
                        conns = new HashSet<string>();
                        _connections[userId] = conns;
                    }
                    conns.Add(connectionId);
                }
            }

            public static void Remove(string userId, string connectionId)
            {
                lock (_connections)
                {
                    if (_connections.TryGetValue(userId, out var conns))
                    {
                        conns.Remove(connectionId);
                        if (conns.Count == 0)
                        {
                            _connections.Remove(userId);
                        }
                    }
                }
            }

            public static IReadOnlyCollection<string> GetConnections(string userId)
            {
                lock (_connections)
                {
                    return _connections.TryGetValue(userId, out var conns) ? conns.ToList() : new List<string>();
                }
            }
        }

        public async Task NotifyGroupCreated(string groupName, string[] userIds)
        {
            Console.WriteLine($"✅ Group created: {groupName} with users: {string.Join(", ", userIds)}");

            foreach (var userId in userIds)
            {
                // Send notification to all users
                await Clients.User(userId).SendAsync("OnGroupCreated", groupName, userIds);
            }

            // ❗ Delay short time to allow clients to receive before joining
            await Task.Delay(500); // optional but helps prevent race condition

            // 🔄 Map userId -> connectionIds
            foreach (var user in userIds)
            {
                var connectionIds = ChatConnectionMapping.GetConnections(user);
                foreach (var connId in connectionIds)
                {
                    await Groups.AddToGroupAsync(connId, groupName);
                }
            }
        }




    }
}
