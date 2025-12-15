import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }

    // 사용자 오프라인 상태로 업데이트
    await User.findByIdAndUpdate(payload.userId, { isOnline: false });

    console.log("✅ 로그아웃 완료:", payload.email);

    return NextResponse.json(
      { message: "로그아웃 되었습니다" },
      { status: 200 }
    );
  } catch (error) {
    console.error("로그아웃 실패:", error);
    return NextResponse.json(
      { error: "로그아웃에 실패했습니다" },
      { status: 500 }
    );
  }
}
