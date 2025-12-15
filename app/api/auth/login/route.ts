import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { generateToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // 사용자 찾기
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    // 온라인 상태 업데이트
    user.isOnline = true;
    await user.save();

    // JWT 토큰 생성
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    // 비밀번호 제외하고 응답
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isOnline: user.isOnline,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log("✅ 로그인 성공:", userResponse.email);

    return NextResponse.json(
      {
        message: "로그인 성공",
        token,
        user: userResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("로그인 실패:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "입력 데이터가 올바르지 않습니다", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "로그인에 실패했습니다" },
      { status: 500 }
    );
  }
}
