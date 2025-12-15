import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";
import { registerSchema } from "@/lib/validations/auth";
import { generateToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      );
    }

    // 사용자 생성 (비밀번호는 User 모델의 pre-save hook에서 자동 해싱)
    const user = await User.create({
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      isOnline: false,
    });

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

    console.log("✅ 회원가입 완료:", userResponse.email);

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다",
        token,
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("회원가입 실패:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "입력 데이터가 올바르지 않습니다", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "회원가입에 실패했습니다" },
      { status: 500 }
    );
  }
}
