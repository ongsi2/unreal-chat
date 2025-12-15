import { NextRequest, NextResponse } from "next/server";
import { createChatRoomSchema } from "@/lib/validations/chatroom";
import { connectDB } from "@/lib/db/mongodb";
import { ChatRoom } from "@/lib/models/ChatRoom";
import { User } from "@/lib/models/User";
import { RedisCache } from "@/lib/db/redis";
import { verifyToken } from "@/lib/auth/jwt";

// GET /api/chatrooms - 모든 채팅방 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // JWT 토큰에서 사용자 정보 가져오기
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    // 모든 활성화된 채팅방 조회 (공개 채팅방이므로 모두에게 표시)
    const chatRooms = await ChatRoom.find({ isActive: true })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    // 로그인한 사용자를 모든 채팅방의 participants에 자동 추가
    if (userId) {
      const updatePromises = chatRooms.map((room) =>
        ChatRoom.findByIdAndUpdate(
          room._id,
          { $addToSet: { participants: userId } },
          { new: true }
        )
      );
      await Promise.all(updatePromises);
      console.log(`👥 사용자 ${userId}를 ${chatRooms.length}개 채팅방에 자동 추가`);
    }

    const formattedRooms = await Promise.all(
      chatRooms.map(async (room) => {
        const roomId = room._id.toString();
        let unreadCount = 0;

        // 로그인한 사용자의 경우 Redis에서 읽지 않은 메시지 수 조회
        if (userId) {
          unreadCount = await RedisCache.getUnreadCount(roomId, userId);
        }

        return {
          id: roomId,
          name: room.name,
          participants: room.participants,
          isActive: room.isActive,
          lastMessageAt: room.lastMessageAt,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          participantDetails: [],
          unreadCount,
        };
      })
    );

    return NextResponse.json({ chatRooms: formattedRooms }, { status: 200 });
  } catch (error) {
    console.error("채팅방 조회 실패:", error);
    return NextResponse.json(
      { error: "채팅방을 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST /api/chatrooms - 새 채팅방 생성
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = createChatRoomSchema.parse(body);

    // 공개 채팅방이므로 생성 시 기존 모든 사용자를 participants에 추가
    // (추후 로그인하는 사용자는 GET /api/chatrooms에서 자동 추가됨)
    const allUsers = await User.find({}, "_id").lean();
    const allUserIds = allUsers.map((user) => user._id.toString());

    const newChatRoom = await ChatRoom.create({
      name: validatedData.name,
      participants: [...new Set([...validatedData.participants, ...allUserIds])], // 중복 제거
      isActive: true,
    });

    const formattedRoom = {
      id: newChatRoom._id.toString(),
      name: newChatRoom.name,
      participants: newChatRoom.participants,
      isActive: newChatRoom.isActive,
      lastMessageAt: newChatRoom.lastMessageAt,
      createdAt: newChatRoom.createdAt,
      updatedAt: newChatRoom.updatedAt,
      participantDetails: [],
      unreadCount: 0,
    };

    console.log(`✅ 채팅방 생성 완료: ${formattedRoom.name} (참여자: ${formattedRoom.participants.length}명)`);

    return NextResponse.json({ chatRoom: formattedRoom }, { status: 201 });
  } catch (error) {
    console.error("채팅방 생성 실패:", error);
    return NextResponse.json(
      { error: "채팅방 생성에 실패했습니다" },
      { status: 400 }
    );
  }
}
