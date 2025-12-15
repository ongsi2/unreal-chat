// User types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ChatRoom types
export interface ChatRoom {
  id: string;
  name: string;
  participants: string[]; // User IDs
  isActive: boolean;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  isRead: boolean;
  readBy: string[]; // Array of user IDs who have read the message
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with populated data
export interface MessageWithSender extends Message {
  sender: User;
}

export interface ChatRoomWithDetails extends ChatRoom {
  participantDetails: User[];
  lastMessage?: Message;
  unreadCount: number;
}
