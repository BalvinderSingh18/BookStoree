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
    timestamp: string;
    status: "sent" | "delivered" | "seen";
    isAttachment?: boolean;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
      downloaded?: boolean;
  }[] = [];

  incomingCall: {
    fromUserId: string;
    callType: "audio" | "video";
    offer: string;
  } | null = null;

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

    selectedAttachment: File | null = null;
  previewUrl: string | null = null;
  showAttachmentModal: boolean = false;
  selectedImageUrl: string | null = null;


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
            timestamp: new Date().toISOString(),
            status: "seen",
          });

          this.saveMessagesToLocalStorage(this.currentUserId, senderId);
          this.scrollToBottom();
          this.cdr.detectChanges();

          this.hubConnection
            .invoke("SeenMessage", messageId)
            .catch(console.error);
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

    this.hubConnection.on(
      "IncomingCall",
      (fromUserId: string, offer: string, callType: string) => {
        const safeCallType: "audio" | "video" =
          callType === "audio" || callType === "video" ? callType : "video";

        this.zone.run(() => {
          this.incomingCall = {
            fromUserId,
            callType: safeCallType,
            offer,
          };
          this.cdr.detectChanges();
        });
      }
    );

    this.hubConnection.on(
      "CallAnswered",
      async (fromUserId: string, answer: string) => {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(JSON.parse(answer))
        );
        this.cdr.detectChanges();
      }
    );

    this.hubConnection.on(
      "IceCandidateReceived",
      async (fromUserId: string, candidate: string) => {
        const iceCandidate = new RTCIceCandidate(JSON.parse(candidate));

        if (this.isRemoteDescriptionSet) {
          try {
            await this.peerConnection.addIceCandidate(iceCandidate);
            this.cdr.detectChanges();
          } catch (error) {
            console.error("❌ Error adding ICE candidate:", error);
          }
        } else {
          this.queuedIceCandidates.push(iceCandidate);
        }
      }
    );

    this.hubConnection.on("CallEnded", (fromUserId: string) => {
      this.endCallInternal();
      alert(`📞 Call ended by ${fromUserId}`);
      this.cdr.detectChanges();
    });

    this.hubConnection.on(
      "ReceiveAttachment",
      (
        senderId: string,
        fileUrl: string,
        fileName: string,
        fileType: string,
        messageId: string
      ) => {
        this.zone.run(() => {
          this.messages.push({
            messageId,
            senderId,
            receiverId: this.currentUserId,
            text: ``,
            timestamp: new Date().toISOString(),
            status: "seen",
            isAttachment: true,
            fileUrl,
            fileName,
            fileType,
          });

          this.saveMessagesToLocalStorage(this.currentUserId, senderId);
          this.scrollToBottom();
          this.cdr.detectChanges();
        });
      }
    );
    this.cdr.detectChanges();

  }

onAttachmentSelected(file: File): void {
  this.selectedAttachment = file;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.previewUrl = e.target.result;
    this.showAttachmentModal = true;
    this.cdr.detectChanges();

  };
  reader.readAsDataURL(file);
}
  sendAttachmentNow(): void {
    if (this.selectedAttachment) {
      this.sendAttachment(this.selectedAttachment);
      this.selectedAttachment = null;
      this.previewUrl = null;
      this.showAttachmentModal = false;
      this.cdr.detectChanges();
    }
  }

  loadUsers(): void {
    this.userService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.userList = result.items.filter(
        (u) => u.id?.toString() !== this.currentUserId
      );
    });
  }
  async acceptCall() {
    if (!this.incomingCall) return;

    const { fromUserId, callType, offer } = this.incomingCall;

    await this.setupWebRTC(callType);

    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(offer))
    );
    this.isRemoteDescriptionSet = true;
    this.cdr.detectChanges();

    for (const candidate of this.queuedIceCandidates) {
      try {
        await this.peerConnection.addIceCandidate(candidate);
        this.cdr.detectChanges();
      } catch (error) {
        console.error("❌ Error adding queued ICE candidate:", error);
      }
    }
    this.queuedIceCandidates = [];

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.cdr.detectChanges();

    this.hubConnection
      .invoke("AnswerCall", fromUserId, JSON.stringify(answer))
      .catch((err) => console.error("❌ Failed to send answer:", err));

    this.isInCall = true;
    this.incomingCall = null;
    this.cdr.detectChanges();
  }

  rejectCall() {
    // You may optionally notify caller
    this.incomingCall = null;
    this.cdr.detectChanges();
  }

selectUser(user: UserDto): void {
  if (this.selectedUser?.id === user.id) return;

  this.zone.run(() => {
    this.selectedUser = user;
    const otherUserId = user.id?.toString() || "";
    this.loadMessagesFromLocalStorage(this.currentUserId, otherUserId);
    this.scrollToBottom();
    this.cdr.detectChanges();
  });
}
trackByUserId(index: number, user: UserDto): number | undefined {
  return user.id;
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

    this.messages.push({
      messageId,
      senderId: this.currentUserId,
      receiverId,
      timestamp: new Date().toISOString(),
      text,
      status: "sent",
    });
    this.message = "";

    this.hubConnection
      .invoke("SendMessageToUser", receiverId, text, messageId)
      .catch((err) => {
        console.error("Send error:", err);
        alert("❌ Failed to send message. Please try again.");
      });

    this.saveMessagesToLocalStorage(this.currentUserId, receiverId);
    this.cdr.detectChanges();
    this.scrollToBottom();
  }
  formatRelativeTime(isoString: string): string {
    const now = new Date();
    const date = new Date(isoString);
    const diff = Math.floor((+now - +date) / 1000); // in seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return date.toLocaleDateString(); // fallback to full date
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
        this.chatWindow.nativeElement.scrollTop =
          this.chatWindow.nativeElement.scrollHeight;
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

  // ✅ Restore timestamps and downloaded status
  this.messages.forEach((m) => {
    if (!m.timestamp) m.timestamp = new Date().toISOString();
    m.downloaded = this.getDownloadStatus(m.messageId); // <- Add this line
  });
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
    if (
      this.selectedUser &&
      confirm("Are you sure you want to clear all messages?")
    ) {
      this.messages = [];
      const otherUserId = this.selectedUser.id?.toString() || "";
      this.saveMessagesToLocalStorage(this.currentUserId, otherUserId);
      this.scrollToBottom();
    }
  }

  deleteChat() {
    this.optionsVisible = false;
    if (
      this.selectedUser &&
      confirm("⚠️ Delete entire chat? This cannot be undone.")
    ) {
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
  private waitForIceGathering(): Promise<void> {
    return new Promise((resolve) => {
      if (this.peerConnection.iceGatheringState === "complete") {
        resolve();
      } else {
        const checkState = () => {
          if (this.peerConnection.iceGatheringState === "complete") {
            this.peerConnection.removeEventListener(
              "icegatheringstatechange",
              checkState
            );
            resolve();
          }
        };
        this.peerConnection.addEventListener(
          "icegatheringstatechange",
          checkState
        );
      }
    });
  }

  async startCall(callType: "audio" | "video") {
    if (!this.selectedUser) return;

    await this.setupWebRTC(callType);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // ✅ Wait until ICE gathering is complete
    await this.waitForIceGathering();

    this.hubConnection.invoke(
      "CallUser",
      this.selectedUser.id?.toString(),
      JSON.stringify(this.peerConnection.localDescription),
      callType
    );

    this.isInCall = true;
  }

  async setupWebRTC(callType: "audio" | "video" = "video") {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    this.cdr.detectChanges();
    this.peerConnection.onconnectionstatechange = () => {
      console.log("🔄 Connection State:", this.peerConnection.connectionState);
    };

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    });

    this.remoteStream = new MediaStream();

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
      this.cdr.detectChanges();
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
          "SendIceCandidate",
          this.selectedUser.id?.toString(),
          JSON.stringify(event.candidate),
          this.cdr.detectChanges()
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
      this.hubConnection.invoke("EndCall", this.selectedUser.id?.toString());
      this.cdr.detectChanges();
    }
    this.endCallInternal();
  }
  toggleMute() {
    if (this.localStream) {
      this.isMicMuted = !this.isMicMuted;
      this.localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !this.isMicMuted));
      this.cdr.detectChanges();
    }
  }

  toggleCamera() {
    if (this.localStream) {
      this.isCameraOff = !this.isCameraOff;
      this.localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !this.isCameraOff));
      this.cdr.detectChanges();
    }
  }
  endCallInternal() {
    this.isInCall = false;
    this.isRemoteDescriptionSet = false;
    this.queuedIceCandidates = [];
    this.incomingCall = null;

    this.localStream?.getTracks().forEach((t) => t.stop());
    this.remoteStream?.getTracks().forEach((t) => t.stop());
    this.peerConnection?.close();
    this.remoteStream = new MediaStream();
    this.localStream = new MediaStream();
  }

  sendAttachment(file: File): void {
    if (!this.selectedUser) return;

    const formData = new FormData();
    formData.append("file", file);

    const token = this.tokenService.getToken(); // Auth token

    fetch(`${AppConsts.remoteServiceBaseUrl}/api/Attachment/Upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(async (res) => {
      const responseText = await res.text(); // 👈 always read raw response first
      try {
const data = JSON.parse(responseText);
console.log("✅ Upload response parsed:", data);

const result = data.result || {};
let { fileUrl, fileName, fileType } = result;

const fallbackName = fileUrl
  ? decodeURIComponent(fileUrl.split("/").pop()?.split("?")[0] || "file")
  : "file";

fileName = !fileName || fileName.toLowerCase() === "blob" ? fallbackName : fileName;

        const messageId = this.generateMessageId();
        const receiverId = this.selectedUser?.id?.toString();

        this.hubConnection
          .invoke(
            "SendAttachmentToUser",
            receiverId,
            fileUrl,
            fileName,
            fileType,
            messageId
          )
          .then(() => {
            this.zone.run(() => {
              this.messages.push({
                messageId,
                senderId: this.currentUserId,
                receiverId: receiverId || "",
                text: ``,
                timestamp: new Date().toISOString(),
                status: "sent",
                isAttachment: true,
                fileUrl,
                fileName,
                fileType,
              });

              this.saveMessagesToLocalStorage(
                this.currentUserId,
                receiverId || ""
              );
              this.scrollToBottom();
              this.cdr.detectChanges();
            });
          })
          .catch((err) => {
            console.error("❌ SignalR send failed:", err);
            alert("❌ Could not send attachment to user.");
          });
      } catch (e) {
        console.error("❌ Failed to parse JSON response", responseText);
        throw new Error("Invalid JSON from server");
      }
    });
  }
downloadAttachment(msg: any): void {
  const token = this.tokenService.getToken();

  fetch(msg.fileUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("❌ Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = msg.fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ✅ Mark as downloaded and persist
      msg.downloaded = true;
      this.setDownloadStatus(msg.messageId, true);
      this.cdr.detectChanges();
    })
    .catch((err) => {
      console.error("Download failed:", err);
      alert("❌ Could not download file.");
    });
}

isViewer(msg: any): boolean {
  return msg.senderId !== this.currentUserId;
}
previewImage(msg: any): void {
  if (this.isViewer(msg) && !msg.downloaded) return; // Don't preview if not downloaded
  this.selectedImageUrl = msg.fileUrl;
}
setDownloadStatus(messageId: string, status: boolean): void {
  localStorage.setItem(`downloaded_${messageId}`, status.toString());
}

getDownloadStatus(messageId: string): boolean {
  return localStorage.getItem(`downloaded_${messageId}`) === "true";
}
}
