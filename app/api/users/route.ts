import { NextRequest, NextResponse } from "next/server";
import { createUserSchema } from "@/lib/validations/user";
import { User } from "@/lib/types";

// Mock data - 실제로는 MongoDB에서 가져옴
let users: User[] = [
  {
    id: "user1",
    username: "사용자1",
    email: "user1@example.com",
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user2",
    username: "사용자2",
    email: "user2@example.com",
    isOnline: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/users - 모든 사용자 조회
export async function GET() {
  try {
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("사용자 조회 실패:", error);
    return NextResponse.json(
      { error: "사용자를 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST /api/users - 새 사용자 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: validatedData.username,
      email: validatedData.email,
      avatar: validatedData.avatar,
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("사용자 생성 실패:", error);
    return NextResponse.json(
      { error: "사용자 생성에 실패했습니다" },
      { status: 400 }
    );
  }
}
