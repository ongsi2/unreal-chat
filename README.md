# Real Chat

실시간 채팅 애플리케이션 with Next.js, Socket.io, MongoDB, Redis

## 기술 스택

- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Socket.io
- **Database**: MongoDB (영구 저장)
- **Cache**: Redis (실시간 데이터 + 캐싱)
- **DevOps**: Docker, Docker Compose

## MongoDB와 Redis의 역할

### MongoDB (영구 저장소)
- 채팅방 정보 저장
- 모든 메시지 히스토리 저장
- 유저 정보 관리
- 메시지 검색 및 페이지네이션

### Redis (실시간 처리 + 캐싱)
- 온라인 유저 목록 (실시간 추가/제거)
- 최근 50개 메시지 캐싱 (빠른 로딩)
- 타이핑 상태 관리
- 읽지 않은 메시지 카운트

### 데이터 흐름
```
메시지 전송:
1. Socket.io → 실시간 전송
2. MongoDB → 영구 저장
3. Redis → 최근 메시지 캐싱

채팅방 열기:
1. Redis 캐시 확인 (0.1초)
2. 캐시 없으면 MongoDB 조회 (0.5초)
3. 조회 결과를 Redis에 캐싱
```

## 시작하기

### 1. Docker로 실행 (권장)

```bash
# MongoDB + Redis + App 한번에 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 종료
docker-compose down

# 볼륨까지 삭제 (데이터 초기화)
docker-compose down -v
```

앱 접속: http://localhost:3333

### 2. 로컬 개발 (MongoDB/Redis만 Docker)

```bash
# MongoDB + Redis만 실행
docker-compose up -d mongodb redis

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 환경 변수

`.env` 파일 (이미 생성됨):
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/realchat?authSource=admin
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3333
```

## 프로젝트 구조

```
real-chat/
├── app/
│   ├── api/
│   │   ├── chatrooms/    # 채팅방 API (MongoDB)
│   │   └── messages/     # 메시지 API (MongoDB + Redis)
│   ├── chatrooms/        # 채팅방 페이지
│   └── page.tsx          # 메인 페이지
├── components/           # React 컴포넌트
├── lib/
│   ├── db/
│   │   ├── mongodb.ts    # MongoDB 연결
│   │   └── redis.ts      # Redis 연결 + 캐싱 헬퍼
│   ├── models/           # MongoDB 스키마
│   │   ├── User.ts
│   │   ├── ChatRoom.ts
│   │   └── Message.ts
│   └── stores/           # Zustand 상태 관리
├── server.ts             # Socket.io 서버
├── docker-compose.yml    # Docker 설정
└── Dockerfile
```

## 주요 기능

### 실시간 기능 (Socket.io)
- ✅ 실시간 메시지 전송/수신
- ✅ 온라인 유저 표시
- ✅ 타이핑 표시
- ✅ 읽음 표시

### 데이터 영속성 (MongoDB)
- ✅ 채팅방 생성/조회
- ✅ 메시지 영구 저장
- ✅ 메시지 히스토리

### 성능 최적화 (Redis)
- ✅ 최근 메시지 캐싱 (50개)
- ✅ 온라인 유저 빠른 조회
- ✅ 읽지 않은 메시지 카운트
- ✅ 타이핑 상태 임시 저장

## 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# 린트
npm run lint
```

## Docker 컨테이너 관리

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# MongoDB 접속
docker exec -it real-chat-mongodb mongosh -u admin -p password123

# Redis 접속
docker exec -it real-chat-redis redis-cli

# 컨테이너 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart app
```

## MongoDB 직접 접속

```bash
# MongoDB Compass 또는 mongosh 사용
mongodb://admin:password123@localhost:27017/realchat?authSource=admin
```

## Redis 데이터 확인

```bash
# Redis CLI 접속
docker exec -it real-chat-redis redis-cli

# 모든 키 확인
KEYS realchat:*

# 온라인 유저 확인
HGETALL realchat:users:online

# 최근 메시지 확인
LRANGE realchat:messages:{roomId} 0 -1
```

## 문제 해결

### MongoDB 연결 실패
```bash
# MongoDB 컨테이너 상태 확인
docker-compose logs mongodb

# MongoDB 재시작
docker-compose restart mongodb
```

### Redis 연결 실패
```bash
# Redis 컨테이너 상태 확인
docker-compose logs redis

# Redis 재시작
docker-compose restart redis
```

### 포트 충돌
- 3333: 앱
- 27017: MongoDB
- 6379: Redis

포트가 이미 사용 중이면 docker-compose.yml에서 포트 변경 가능

## 라이센스

MIT
