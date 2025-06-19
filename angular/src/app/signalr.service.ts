import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AppConsts } from '../shared/AppConsts';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;

  constructor() {}

  /**
   * Initializes the SignalR connection with access token and auto reconnect
   */
  initConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${AppConsts.remoteServiceBaseUrl}/signalr-chat`, {
        accessTokenFactory: () => abp.auth.getToken(),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ SignalR connected'))
      .catch((err) => console.error('❌ SignalR connection error: ', err));
  }

  /**
   * Sends a private message to a specific user
   */
  sendMessageToUser(receiverId: string, message: string, messageId: string): void {
    this.hubConnection.invoke('SendMessageToUser', receiverId, message, messageId)
      .catch((err) => console.error('❌ Error sending message:', err));
  }

  /**
   * Sends a "seen" status update for a message
   */
  sendSeenMessage(messageId: string): void {
    this.hubConnection.invoke('SeenMessage', messageId)
      .catch((err) => console.error('❌ Error sending seen status:', err));
  }

  /**
   * Subscribes to receive new messages
   */
  onReceiveMessage(callback: (senderId: string, message: string, messageId: string) => void): void {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  /**
   * Subscribes to message "sent" confirmations (acknowledgement to sender)
   */
  onMessageSent(callback: (receiverId: string, message: string, messageId: string) => void): void {
    this.hubConnection.on('MessageSent', callback);
  }

  /**
   * Subscribes to message "seen" events
   */
  onMessageSeen(callback: (messageId: string, senderId: string) => void): void {
    this.hubConnection.on('MessageSeen', callback);
  }

  /**
   * Sends a broadcast message (optional use)
   */
  sendMessageToAll(message: string): void {
    this.hubConnection.invoke('SendMessageToAll', message)
      .catch((err) => console.error('❌ Error broadcasting message:', err));
  }

  /**
   * Subscribes to connection status changes
   */
  onReconnect(callback: () => void): void {
    this.hubConnection.onreconnected(() => {
      console.log('🔁 Reconnected to SignalR');
      callback();
    });
  }

  /**
   * Gracefully disconnect SignalR
   */
  disconnect(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('🔌 SignalR disconnected'));
    }
  }

  /**
   * Returns connection status
   */
  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
  /**
 * Initiates a call to a specific user
 */
callUser(receiverId: string, offer: string, callType: 'video' | 'audio'): void {
  this.hubConnection.invoke('CallUser', receiverId, offer, callType)
    .catch(err => console.error('❌ Error initiating call:', err));
}

/**
 * Answers a call from another user
 */
answerCall(callerId: string, answer: string): void {
  this.hubConnection.invoke('AnswerCall', callerId, answer)
    .catch(err => console.error('❌ Error answering call:', err));
}

/**
 * Ends the call with a specific user
 */
endCall(otherUserId: string): void {
  this.hubConnection.invoke('EndCall', otherUserId)
    .catch(err => console.error('❌ Error ending call:', err));
}

/**
 * Sends an ICE candidate to the other user
 */
sendIceCandidate(otherUserId: string, candidate: string): void {
  this.hubConnection.invoke('SendIceCandidate', otherUserId, candidate)
    .catch(err => console.error('❌ Error sending ICE candidate:', err));
}

}
