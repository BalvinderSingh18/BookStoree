import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";
import { AppSessionService } from "../../shared/session/app-session.service";
import {
  UserDto,
  UserServiceProxy,
} from "../../shared/service-proxies/service-proxies";
import { AppConsts } from "../../shared/AppConsts";
import * as signalR from "@microsoft/signalr";
import { EmojiModule } from "@ctrl/ngx-emoji-mart/ngx-emoji";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { TokenService } from "@node_modules/abp-ng2-module";

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [SharedModule, CommonModule, EmojiModule, PickerModule],
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatComponent implements OnInit {
  @ViewChild("chatWindow") chatWindow!: ElementRef;
  @ViewChild("localVideo") localVideoRef!: ElementRef;
  @ViewChild("remoteVideo") remoteVideoRef!: ElementRef;

  hubConnection!: signalR.HubConnection;
  userList: UserDto[] = [];
  selectedUser: UserDto | null = null;

  currentUserId: string = "";
  currentUserName: string = "";
  message: string = "";
  messages: {
    messageId: string;
    senderId: string;
    receiverId: string;
    text: string;
    status: "sent" | "delivered" | "seen";
  }[] = [];

  showEmojiPicker = false;
  optionsVisible = false;

  localStream!: MediaStream;
  remoteStream!: MediaStream;
  peerConnection!: RTCPeerConnection;
  isInCall: boolean = false;
  isMicMuted: boolean = false;
isCameraOff: boolean = false;
private isRemoteDescriptionSet = false;
private queuedIceCandidates: RTCIceCandidate[] = [];


  constructor(
    private appSession: AppSessionService,
    private userService: UserServiceProxy,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.appSession.userId?.toString() || "";
    this.currentUserName = this.appSession.user?.userName || "Guest";

    this.loadUsers();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${AppConsts.remoteServiceBaseUrl}/signalr/chatHub`, {
        accessTokenFactory: () => this.tokenService.getToken(),
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log("✅ SignalR Connected"))
      .catch((err) => console.error("❌ SignalR Connection Error:", err));

    this.hubConnection.on(
      "ReceiveMessage",
      (senderId: string, text: string, messageId: string) => {
        this.zone.run(() => {
          this.messages.push({
            messageId,
            senderId,
            receiverId: this.currentUserId,
            text,
            status: "seen",
          });

          this.saveMessagesToLocalStorage(this.currentUserId, senderId);
          this.scrollToBottom();
          this.cdr.detectChanges();

          this.hubConnection.invoke("SeenMessage", messageId).catch(console.error);
        });
      }
    );

    this.hubConnection.on("MessageSeen", (messageId: string) => {
      const msg = this.messages.find((m) => m.messageId === messageId);
      if (msg) {
        msg.status = "seen";
        this.saveMessagesToLocalStorage(msg.senderId, msg.receiverId);
        this.cdr.detectChanges();
      }
    });

this.hubConnection.on("IncomingCall", async (fromUserId: string, offer: string, callType: string) => {
  const accept = confirm(`${fromUserId} is calling you via ${callType}. Accept?`);
  if (!accept) return;

  // Narrow the type of callType
  const safeCallType = (callType === 'audio' || callType === 'video') ? callType : 'video';

  await this.setupWebRTC(safeCallType); // Now TypeScript is happy

  await this.peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)));
  this.isRemoteDescriptionSet = true;

  for (const candidate of this.queuedIceCandidates) {
    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error("❌ Error adding queued ICE candidate:", error);
    }
  }
  this.queuedIceCandidates = [];

  const answer = await this.peerConnection.createAnswer();
  await this.peerConnection.setLocalDescription(answer);

  this.hubConnection.invoke("AnswerCall", fromUserId, JSON.stringify(answer))
    .catch((err) => console.error("❌ Failed to send answer:", err));

  this.isInCall = true;
});



    this.hubConnection.on("CallAnswered", async (fromUserId: string, answer: string) => {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
    });

this.hubConnection.on("IceCandidateReceived", async (fromUserId: string, candidate: string) => {
  const iceCandidate = new RTCIceCandidate(JSON.parse(candidate));

  if (this.isRemoteDescriptionSet) {
    try {
      await this.peerConnection.addIceCandidate(iceCandidate);
    } catch (error) {
      console.error("❌ Error adding ICE candidate:", error);
    }
  } else {
    this.queuedIceCandidates.push(iceCandidate);
  }
});

    this.hubConnection.on("CallEnded", (fromUserId: string) => {
      this.endCallInternal();
      alert(`📞 Call ended by ${fromUserId}`);
    });
  }

  loadUsers(): void {
    this.userService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.userList = result.items.filter((u) => u.id?.toString() !== this.currentUserId);
    });
  }

  selectUser(user: UserDto): void {
    this.selectedUser = user;
    const otherUserId = user.id?.toString() || "";
    this.loadMessagesFromLocalStorage(this.currentUserId, otherUserId);
  }

  sendMessage(): void {
    if (!this.message.trim() || !this.selectedUser) return;
    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.warn("SignalR connection is not established yet.");
      alert("⚠️ Message cannot be sent. Chat is not connected yet.");
      return;
    }

    const messageId = this.generateMessageId();
    const receiverId = this.selectedUser.id?.toString() || "";
    const text = this.message;

    this.messages.push({ messageId, senderId: this.currentUserId, receiverId, text, status: "sent" });
    this.message = "";

    this.hubConnection.invoke("SendMessageToUser", receiverId, text, messageId).catch((err) => {
      console.error("Send error:", err);
      alert("❌ Failed to send message. Please try again.");
    });

    this.saveMessagesToLocalStorage(this.currentUserId, receiverId);
    this.scrollToBottom();
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native;
    if (emoji) {
      this.message += emoji;
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatWindow) {
        this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
      }
    }, 100);
  }

  generateMessageId(): string {
    return "msg-" + Math.random().toString(36).substr(2, 9);
  }

  loadMessagesFromLocalStorage(user1: string, user2: string): void {
    const sorted = [user1, user2].sort();
    const chatKey = `chatMessages-${sorted[0]}-${sorted[1]}`;
    const saved = localStorage.getItem(chatKey);
    this.messages = saved ? JSON.parse(saved) : [];
  }

  saveMessagesToLocalStorage(user1: string, user2: string): void {
    const sorted = [user1, user2].sort();
    const chatKey = `chatMessages-${sorted[0]}-${sorted[1]}`;
    localStorage.setItem(chatKey, JSON.stringify(this.messages));
  }

  toggleOptions() {
    this.optionsVisible = !this.optionsVisible;
  }

  clearMessages() {
    this.optionsVisible = false;
    if (this.selectedUser && confirm("Are you sure you want to clear all messages?")) {
      this.messages = [];
      const otherUserId = this.selectedUser.id?.toString() || "";
      this.saveMessagesToLocalStorage(this.currentUserId, otherUserId);
      this.scrollToBottom();
    }
  }

  deleteChat() {
    this.optionsVisible = false;
    if (this.selectedUser && confirm("⚠️ Delete entire chat? This cannot be undone.")) {
      const receiverId = this.selectedUser.id?.toString() || "";
      const sorted = [this.currentUserId, receiverId].sort();
      const chatKey = `chatMessages-${sorted[0]}-${sorted[1]}`;
      this.messages = [];
      localStorage.removeItem(chatKey);
      this.cdr.detectChanges();
      this.scrollToBottom();
      alert("🗑️ Chat deleted successfully.");
    }
  }

  async startCall(callType: 'audio' | 'video') {
    if (!this.selectedUser) return;
    await this.setupWebRTC(callType);
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.hubConnection.invoke(
      'CallUser',
      this.selectedUser.id?.toString(),
      JSON.stringify(offer),
      callType
    );
    this.isInCall = true;
  }

  async setupWebRTC(callType: 'audio' | 'video' = 'video') {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: callType === 'video',
      audio: true,
    });

    this.remoteStream = new MediaStream();

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
      this.attachRemoteVideo();
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.selectedUser) {
        this.hubConnection.invoke(
          'SendIceCandidate',
          this.selectedUser.id?.toString(),
          JSON.stringify(event.candidate)
        );
      }
    };

    this.attachLocalVideo();
  }

  attachLocalVideo() {
    if (this.localVideoRef) {
      const video = this.localVideoRef.nativeElement as HTMLVideoElement;
      video.srcObject = this.localStream;
    }
  }

  attachRemoteVideo() {
    if (this.remoteVideoRef) {
      const video = this.remoteVideoRef.nativeElement as HTMLVideoElement;
      video.srcObject = this.remoteStream;
    }
  }

  endCall() {
    if (this.selectedUser) {
      this.hubConnection.invoke('EndCall', this.selectedUser.id?.toString());
    }
    this.endCallInternal();
  }
  toggleMute() {
  if (this.localStream) {
    this.isMicMuted = !this.isMicMuted;
    this.localStream.getAudioTracks().forEach(track => (track.enabled = !this.isMicMuted));
  }
}

toggleCamera() {
  if (this.localStream) {
    this.isCameraOff = !this.isCameraOff;
    this.localStream.getVideoTracks().forEach(track => (track.enabled = !this.isCameraOff));
  }
}
  endCallInternal() {
    this.isInCall = false;
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.remoteStream?.getTracks().forEach((t) => t.stop());
    this.peerConnection?.close();
    this.remoteStream = new MediaStream();
    this.localStream = new MediaStream();
  }
}
