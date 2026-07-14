export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserAvatar: string | null;
  otherUserRole: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
  mine: boolean;
  readAt: string | null;
}
