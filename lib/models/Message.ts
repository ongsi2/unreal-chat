import mongoose, { Schema, model, models } from 'mongoose';

export interface IMessage {
  _id: string;
  content: string;
  senderId: string;
  roomId: string;
  isRead: boolean;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 인덱스 추가 (빠른 조회)
MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

export const Message = models.Message || model<IMessage>('Message', MessageSchema);
