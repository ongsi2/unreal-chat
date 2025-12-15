import mongoose, { Schema, model, models } from 'mongoose';

export interface IChatRoom {
  _id: string;
  name: string;
  participants: string[];
  isActive: boolean;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 추가 (성능 향상)
ChatRoomSchema.index({ participants: 1 });
ChatRoomSchema.index({ isActive: 1, lastMessageAt: -1 });

export const ChatRoom = models.ChatRoom || model<IChatRoom>('ChatRoom', ChatRoomSchema);
