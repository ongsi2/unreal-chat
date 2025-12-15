import { NextRequest, NextResponse } from "next/server";
import { createMessageSchema } from "@/lib/validations/message";
import { connectDB } from "@/lib/db/mongodb";
import { Message } from "@/lib/models/Message";
import { ChatRoom } from "@/lib/models/ChatRoom";
import { RedisCache } from "@/lib/db/redis";

// GET /api/messages?roomId=xxx - 특정 채팅방의 메시지 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    if (!roomId) {
      return NextResponse.json(
        { error: "채팅방 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 먼저 Redis 캐시 확인 (최근 메시지)
    if (skip === 0) {
      const cachedMessages = await RedisCache.getRecentMessages(roomId);
      if (cachedMessages) {
        console.log("✅ Redis에서 메시지 로드:", cachedMessages.length);
        return NextResponse.json({ messages: cachedMessages }, { status: 200 });
      }
    }

    // Redis에 없으면 MongoDB에서 조회
    await connectDB();

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id.toString(),
      content: msg.content,
      senderId: msg.senderId,
      roomId: msg.roomId,
      isRead: msg.isRead,
      readBy: msg.readBy || [],
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      sender: {
        id: msg.senderId,
        username: "사용자",
        email: "user@example.com",
        isOnline: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }));

    // Redis에 캐싱 (최근 50개)
    if (skip === 0 && formattedMessages.length > 0) {
      await RedisCache.cacheRecentMessages(roomId, formattedMessages);
      console.log("✅ MongoDB에서 메시지 로드 및 Redis 캐싱:", formattedMessages.length);
    }

    return NextResponse.json({ messages: formattedMessages }, { status: 200 });
  } catch (error) {
    console.error("메시지 조회 실패:", error);
    return NextResponse.json(
      { error: "메시지를 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST /api/messages - 새 메시지 생성
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // MongoDB에 메시지 저장
    const newMessage = await Message.create({
      content: validatedData.content,
      senderId: validatedData.senderId,
      roomId: validatedData.roomId,
      isRead: false,
      readBy: [],
    });

    // 채팅방의 lastMessageAt 업데이트
    await ChatRoom.findByIdAndUpdate(validatedData.roomId, {
      lastMessageAt: new Date(),
    });

    const formattedMessage = {
      id: newMessage._id.toString(),
      content: newMessage.content,
      senderId: newMessage.senderId,
      roomId: newMessage.roomId,
      isRead: newMessage.isRead,
      readBy: newMessage.readBy || [],
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
      sender: {
        id: validatedData.senderId,
        username: "사용자",
        email: "user@example.com",
        isOnline: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    // Redis에 메시지 추가
    await RedisCache.addMessage(validatedData.roomId, formattedMessage);

    console.log("✅ 메시지 저장 완료 (MongoDB + Redis)");

    return NextResponse.json({ message: formattedMessage }, { status: 201 });
  } catch (error) {
    console.error("메시지 생성 실패:", error);
    return NextResponse.json(
      { error: "메시지 전송에 실패했습니다" },
      { status: 400 }
    );
  }
}
