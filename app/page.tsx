"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, LogOut } from "lucide-react";
import { useUserStore } from "@/lib/stores/user-store";

export default function Home() {
  const router = useRouter();
  const { currentUser, token, logout, _hasHydrated } = useUserStore();

  // 로그인 상태 확인 (hydration 이후)
  const isLoggedIn = _hasHydrated && currentUser && token;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("로그아웃 에러:", error);
    } finally {
      logout();
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Subtle background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <MessageCircle className="h-16 w-16 text-slate-700" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
          Real Chat
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-12 font-normal">
          실시간 채팅의 새로운 경험
        </p>

        {isLoggedIn ? (
          <>
            <p className="text-lg text-slate-700 mb-8">
              환영합니다, <span className="font-bold">{currentUser.username}</span>님!
            </p>
            <div className="flex justify-center gap-4 mb-16">
              <Link href="/chatrooms">
                <Button
                  size="lg"
                  className="gap-2 text-lg px-8 py-6 bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
                >
                  <MessageCircle className="h-5 w-5" />
                  채팅방으로 가기
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={handleLogout}
                className="gap-2 text-lg px-8 py-6 border-slate-900 text-slate-900 hover:bg-slate-100 transition-colors shadow-md"
              >
                <LogOut className="h-5 w-5" />
                로그아웃
              </Button>
            </div>
          </>
        ) : (
          <div className="flex justify-center gap-4 mb-16">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="gap-2 text-lg px-8 py-6 bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
              >
                <MessageCircle className="h-5 w-5" />
                로그인
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 py-6 border-slate-900 text-slate-900 hover:bg-slate-100 transition-colors shadow-md"
              >
                회원가입
              </Button>
            </Link>
          </div>
        )}

        <div className="flex gap-8 justify-center text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            <span>실시간 메시징</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            <span>안전한 채팅</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            <span>빠른 응답</span>
          </div>
        </div>
      </div>
    </div>
  );
}
