import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { ChatRoom } from "@/lib/models/ChatRoom";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { userId } = await request.json();
    const { id: roomId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 채팅방 존재 확인만 수행 (participants에서 제거하지 않음)
    // 이유: 공개 채팅방이므로 나중에 메시지 알림을 받아야 함
    const chatRoom = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return NextResponse.json(
        { error: "채팅방을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    console.log(`✅ 사용자 ${userId}가 채팅방 ${roomId}에서 나갔습니다 (MongoDB participants 유지)`);
    console.log(`📊 전체 참여자: ${chatRoom.participants.length}명`);

    return NextResponse.json(
      { message: "채팅방에서 나갔습니다", chatRoom },
      { status: 200 }
    );
  } catch (error) {
    console.error("채팅방 나가기 실패:", error);
    return NextResponse.json(
      { error: "채팅방에서 나가는데 실패했습니다" },
      { status: 500 }
    );
  }
}
