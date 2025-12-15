import { NextRequest, NextResponse } from "next/server";
import { updateChatRoomSchema } from "@/lib/validations/chatroom";

// Mock data - 실제로는 MongoDB에서 가져옴
const chatRooms = new Map();

// GET /api/chatrooms/[id] - 특정 채팅방 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatRoom = chatRooms.get(id);

    if (!chatRoom) {
      return NextResponse.json(
        { error: "채팅방을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ chatRoom }, { status: 200 });
  } catch (error) {
    console.error("채팅방 조회 실패:", error);
    return NextResponse.json(
      { error: "채팅방 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// PATCH /api/chatrooms/[id] - 채팅방 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateChatRoomSchema.parse(body);

    const chatRoom = chatRooms.get(id);

    if (!chatRoom) {
      return NextResponse.json(
        { error: "채팅방을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const updatedChatRoom = {
      ...chatRoom,
      ...validatedData,
      updatedAt: new Date(),
    };

    chatRooms.set(id, updatedChatRoom);

    return NextResponse.json({ chatRoom: updatedChatRoom }, { status: 200 });
  } catch (error) {
    console.error("채팅방 수정 실패:", error);
    return NextResponse.json(
      { error: "채팅방 수정에 실패했습니다" },
      { status: 400 }
    );
  }
}

// DELETE /api/chatrooms/[id] - 채팅방 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatRoom = chatRooms.get(id);

    if (!chatRoom) {
      return NextResponse.json(
        { error: "채팅방을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    chatRooms.delete(id);

    return NextResponse.json(
      { message: "채팅방이 삭제되었습니다" },
      { status: 200 }
    );
  } catch (error) {
    console.error("채팅방 삭제 실패:", error);
    return NextResponse.json(
      { error: "채팅방 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
