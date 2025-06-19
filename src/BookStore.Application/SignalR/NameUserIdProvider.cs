using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

public class NameUserIdProvider : IUserIdProvider
{
    public string GetUserId(HubConnectionContext connection)
    {
        // This will use the username (e.g., email) as user ID
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}