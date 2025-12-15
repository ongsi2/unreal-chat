# 💬 Real Chat

**실시간 공개 채팅 웹 애플리케이션**

Next.js + Socket.io + MongoDB + Redis로 구축한 현대적인 실시간 채팅 서비스

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?style=flat-square&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-9.0-47a248?style=flat-square&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-5.10-dc382d?style=flat-square&logo=redis)

---

## ✨ 주요 기능

### 🚀 실시간 통신
- **즉각적인 메시지 전송** - Socket.io 기반 양방향 통신
- **실시간 참여자 수** - 채팅방별 온라인 사용자 표시
- **자동 정렬** - 새 메시지가 올 때 채팅방 자동 최상단 이동

### 💬 채팅 기능
- **공개 채팅방** - 모든 사용자가 모든 채팅방 참여 가능
- **읽지 않은 메시지 알림** - 빨간 배지로 실시간 표시
- **채팅방 생성** - 원하는 주제로 자유롭게 채팅방 생성

### 🔐 사용자 인증
- **JWT 기반 인증** - 안전한 토큰 인증 방식
- **비밀번호 암호화** - bcryptjs를 이용한 해싱
- **세션 유지** - Zustand persist로 로그인 상태 유지

### ⚡ 성능 최적화
- **Redis 캐싱** - 읽지 않은 메시지 수, 온라인 사용자 등 캐싱
- **MongoDB 인덱싱** - 빠른 쿼리 성능
- **반응형 디자인** - 모바일/태블릿/데스크톱 모두 지원

---

## 🛠️ 기술 스택

### Frontend
| 기술 | 용도 |
|------|------|
| Next.js 15 | React 프레임워크 (App Router) |
| React 19 | UI 라이브러리 |
| TypeScript | 타입 안정성 |
| Tailwind CSS | 유틸리티 CSS 프레임워크 |
| shadcn/ui | UI 컴포넌트 라이브러리 |
| Zustand | 경량 상태 관리 |
| Socket.io Client | 실시간 통신 클라이언트 |
| React Hook Form | 폼 관리 |
| Zod | 스키마 검증 |

### Backend
| 기술 | 용도 |
|------|------|
| Node.js | 서버 런타임 |
| Socket.io | 실시간 양방향 통신 |
| MongoDB (Mongoose) | NoSQL 데이터베이스 |
| Redis (ioredis) | 인메모리 캐시 |
| JWT | 인증 토큰 |
| bcryptjs | 비밀번호 암호화 |

### DevOps
| 기술 | 용도 |
|------|------|
| tsx | TypeScript 실행 환경 |
| Playwright | E2E 테스팅 |
| dotenv | 환경 변수 관리 |

---

## 📦 빠른 시작

### 1️⃣ 필수 조건

시작하기 전에 다음 프로그램들이 설치되어 있어야 합니다:

- **Node.js** 20.x 이상
- **MongoDB** 7.x 이상 (로컬 또는 MongoDB Atlas)
- **Redis** 7.x 이상 (로컬)

### 2️⃣ 저장소 클론

```bash
git clone <repository-url>
cd real-chat
```

### 3️⃣ 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 입력하세요:

```env
# MongoDB 연결 문자열
MONGODB_URI=mongodb://localhost:27017/real-chat

# Redis 연결 정보
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 시크릿 키 (랜덤한 문자열로 변경하세요)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 서버 포트
PORT=3333

# Node 환경
NODE_ENV=development
```

### 4️⃣ 의존성 설치

```bash
npm install
```

### 5️⃣ 데이터베이스 초기화 (선택)

```bash
# MongoDB + Redis 완전 초기화
npm run reset-all

# 또는 개별 초기화
npm run reset-db      # MongoDB만 초기화
npm run reset-redis   # Redis만 초기화
```

### 6️⃣ 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 브라우저에서 **http://localhost:3333** 으로 접속하세요! 🎉

---

## 📝 NPM 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (tsx watch) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run reset-db` | MongoDB 초기화 (메시지, 채팅방, 사용자 삭제) |
| `npm run reset-redis` | Redis 캐시 초기화 |
| `npm run reset-all` | MongoDB + Redis 완전 초기화 |
| `npm run seed` | 테스트 채팅방 4개 생성 |
| `npx playwright test` | E2E 테스트 실행 |

---

## 🎮 사용 방법

### 1. 회원가입 및 로그인

1. 홈페이지에서 **"회원가입"** 버튼 클릭
2. 사용자명, 이메일, 비밀번호 입력하여 가입
3. 가입 후 자동 로그인 또는 로그인 페이지에서 로그인

### 2. 채팅방 둘러보기

- 좌측 사이드바에서 채팅방 목록 확인
- 자동으로 모든 사용자가 모든 채팅방에 참여됨
- 빨간 배지는 읽지 않은 메시지 개수 표시

### 3. 메시지 보내기

1. 원하는 채팅방 클릭하여 입장
2. 하단 입력창에 메시지 입력
3. **Enter** 키 또는 전송 버튼 클릭

### 4. 새 채팅방 만들기

1. **"새 채팅방"** 버튼 클릭
2. 채팅방 이름 입력 (예: "자유 수다방 💬")
3. 생성 버튼 클릭

---

## 🏗️ 프로젝트 구조

```
real-chat/
│
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 auth/                 # 인증 API (회원가입, 로그인, 로그아웃)
│   │   ├── 📁 chatrooms/            # 채팅방 API (CRUD, 나가기)
│   │   └── 📁 messages/             # 메시지 API (조회)
│   ├── 📁 auth/                     # 인증 페이지 (로그인, 회원가입)
│   ├── 📁 chatrooms/                # 채팅방 메인 페이지
│   ├── 📄 page.tsx                  # 홈페이지
│   ├── 📄 layout.tsx                # 루트 레이아웃
│   └── 📄 globals.css               # 글로벌 스타일
│
├── 📁 components/                   # React 컴포넌트
│   ├── 📁 chatrooms/                # 채팅방 관련 (리스트, 생성 다이얼로그)
│   ├── 📁 messages/                 # 메시지 관련 (리스트, 입력창)
│   └── 📁 ui/                       # shadcn/ui 공통 컴포넌트
│
├── 📁 lib/                          # 유틸리티 & 설정
│   ├── 📁 auth/                     # JWT 생성/검증
│   ├── 📁 contexts/                 # React Context (Socket.io)
│   ├── 📁 db/                       # 데이터베이스 연결
│   │   ├── mongodb.ts               # MongoDB 연결 풀
│   │   └── redis.ts                 # Redis 클라이언트 + 캐싱 헬퍼
│   ├── 📁 models/                   # MongoDB 스키마
│   │   ├── User.ts                  # 사용자 모델
│   │   ├── ChatRoom.ts              # 채팅방 모델
│   │   └── Message.ts               # 메시지 모델
│   ├── 📁 stores/                   # Zustand 상태 관리
│   │   ├── user-store.ts            # 사용자 상태
│   │   ├── chatroom-store.ts        # 채팅방 상태
│   │   └── message-store.ts         # 메시지 상태
│   ├── 📁 types/                    # TypeScript 타입 정의
│   └── 📁 validations/              # Zod 스키마 검증
│
├── 📁 scripts/                      # 유틸리티 스크립트
│   ├── reset-db.ts                  # DB 초기화
│   ├── reset-redis.ts               # Redis 초기화
│   ├── seed-chatrooms.ts            # 테스트 채팅방 생성
│   └── list-users.ts                # 사용자 목록 조회
│
├── 📁 tests/                        # Playwright E2E 테스트
│   ├── complete-flow.spec.ts        # 전체 플로우 테스트
│   ├── read-receipts.spec.ts        # 읽음 표시 테스트
│   └── unread-count.spec.ts         # 읽지 않은 메시지 테스트
│
├── 📄 server.ts                     # Socket.io 서버 (실시간 통신)
├── 📄 next.config.ts                # Next.js 설정
├── 📄 tailwind.config.ts            # Tailwind CSS 설정
├── 📄 tsconfig.json                 # TypeScript 설정
├── 📄 package.json                  # 의존성 관리
└── 📄 .env                          # 환경 변수 (gitignore)
```

---

## 🔧 주요 기능 상세

### 1. 실시간 메시징 (Socket.io)

```typescript
// 서버: server.ts
socket.on("message:send", async (message) => {
  // 1. MongoDB에 영구 저장
  await Message.create(message);

  // 2. Redis에 캐싱
  await RedisCache.addMessage(roomId, message);

  // 3. 채팅방의 모든 사용자에게 전송
  io.to(roomId).emit("message:receive", message);
});

// 클라이언트: message-list.tsx
socket.on("message:receive", (message) => {
  addMessage(message);
});
```

### 2. 읽지 않은 메시지 알림

```typescript
// 서버: 현재 채팅방에 없는 사용자의 unread count 증가
for (const participantId of chatRoom.participants) {
  if (!roomUserIds.includes(participantId)) {
    await RedisCache.incrementUnreadCount(roomId, participantId);
    io.to(userSocketId).emit("unread:increment", { roomId });
  }
}

// 클라이언트: 배지 표시
{room.unreadCount > 0 && (
  <div className="bg-red-500 text-white rounded-full">
    {room.unreadCount}
  </div>
)}
```

### 3. JWT 인증

```typescript
// 회원가입
const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({ username, email, password: hashedPassword });
const token = jwt.sign({ userId: user._id }, JWT_SECRET);

// API 인증
const payload = verifyToken(token);
if (!payload) return unauthorized();
```

### 4. 자동 채팅방 정렬

```typescript
// 새 메시지 받으면 lastMessageAt 업데이트 후 정렬
incrementUnreadCount: (roomId) => {
  const updatedRooms = chatRooms.map(room =>
    room.id === roomId
      ? { ...room, unreadCount: room.unreadCount + 1, lastMessageAt: new Date() }
      : room
  );
  updatedRooms.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}
```

---

## 🧪 테스트

### E2E 테스트 (Playwright)

```bash
# 모든 테스트 실행
npx playwright test

# 브라우저 보이게 실행
npx playwright test --headed

# 특정 테스트만 실행
npx playwright test tests/complete-flow.spec.ts

# UI 모드로 실행 (디버깅)
npx playwright test --ui
```

### 테스트 시나리오

- ✅ 회원가입 및 로그인
- ✅ 채팅방 생성
- ✅ 메시지 전송 및 수신
- ✅ 읽지 않은 메시지 배지 표시
- ✅ 채팅방 나가기
- ✅ 배지 자동 제거 (메시지 읽은 후)

---

## 📈 향후 개발 계획

### 🟢 쉬움 (서버에 이미 구현됨)
- [ ] **타이핑 중 표시** - "ongsi2님이 입력 중..."
- [ ] **온라인 사용자 목록** - 사이드바에 접속자 표시

### 🟡 중간
- [ ] **다크 모드** - 밤에 눈 편하게
- [ ] **메시지 검색** - 채팅방 내 검색 기능
- [ ] **알림음** - 새 메시지 도착 시 소리
- [ ] **이모지 피커** - 이모지 선택 UI
- [ ] **프로필 편집** - 닉네임, 아바타 변경

### 🔴 고급
- [ ] **이미지/파일 전송** - 멀티미디어 지원
- [ ] **메시지 수정/삭제** - 내 메시지 편집
- [ ] **답장(Reply) 기능** - 특정 메시지에 답장
- [ ] **1:1 DM 채팅** - 개인 메시지
- [ ] **메시지 페이지네이션** - 무한 스크롤
- [ ] **알림 권한** - 브라우저 푸시 알림

---

## 🐛 트러블슈팅

### MongoDB 연결 실패

```bash
# MongoDB 실행 여부 확인
mongosh

# 또는 MongoDB 서비스 시작
# Windows: services.msc에서 MongoDB 시작
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Redis 연결 실패

```bash
# Redis 실행 여부 확인
redis-cli ping
# 응답: PONG

# Redis 서비스 시작
# Windows: redis-server
# macOS: brew services start redis
# Linux: sudo systemctl start redis
```

### 포트 이미 사용 중

```bash
# 포트 3333을 사용하는 프로세스 찾기
# Windows
netstat -ano | findstr :3333

# macOS/Linux
lsof -i :3333

# 프로세스 종료 후 다시 시작
```

### 캐시 문제

```bash
# Next.js 빌드 캐시 삭제
rm -rf .next

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

---

## 🔒 보안 고려사항

### 프로덕션 배포 전 체크리스트

- [ ] `.env`에서 `JWT_SECRET` 변경 (랜덤한 긴 문자열)
- [ ] MongoDB 인증 활성화 및 강력한 비밀번호 설정
- [ ] Redis 비밀번호 설정
- [ ] HTTPS 적용
- [ ] CORS 설정 검토
- [ ] Rate Limiting 추가
- [ ] 입력 검증 강화
- [ ] XSS, CSRF 방어 검토

---

## 📄 라이선스

MIT License

---

## 👨‍💻 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 💡 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Redis Documentation](https://redis.io/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

Made with ❤️ using Next.js & Socket.io
