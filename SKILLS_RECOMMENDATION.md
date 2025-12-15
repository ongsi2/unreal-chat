# 실시간 채팅 서비스 개발을 위한 스킬 추천

## 프로젝트 개요
- **기술 스택**: Node.js, Socket.io, Redis, MongoDB, Next.js
- **목표**: 실시간 채팅 서비스 구축

---

## 추천 스킬 및 활용 방안

### 1. 🚀 nextjs15-init (최우선 추천)

**추천 이유**:
- Next.js 15 + App Router 기반 프로젝트 자동 생성
- ShadCN UI, Zustand (상태관리), Tanstack Query 등 최신 스택 포함
- Custom domain 옵션으로 채팅 서비스에 맞는 구조 생성 가능

**활용 방안**:
```
/nextjs15-init 실행 → Custom domain 선택 → "실시간 채팅 서비스" 입력
```

**제공되는 기능**:
- 기본 프로젝트 구조 및 설정
- TypeScript 설정
- ESLint, Prettier 설정
- 상태 관리 (Zustand)
- API 호출 관리 (Tanstack Query)
- UI 컴포넌트 라이브러리 (ShadCN)

**채팅 서비스 적용**:
- Zustand로 채팅방 상태, 메시지 상태 관리
- Tanstack Query로 MongoDB 데이터 페칭
- ShadCN UI로 채팅 인터페이스 컴포넌트 구성

---

### 2. 🎨 frontend-design (UI/UX 개발에 추천)

**추천 이유**:
- 프로덕션급 프론트엔드 인터페이스 생성
- 일반적인 AI 디자인이 아닌 독특하고 세련된 디자인
- 채팅 UI의 핵심 컴포넌트들을 고품질로 제작 가능

**활용 방안**:
채팅 서비스의 주요 컴포넌트 개발 시 사용:
- 채팅방 목록 UI
- 메시지 입력 컴포넌트
- 실시간 메시지 표시 영역
- 사용자 프로필 카드
- 알림 시스템

**예상 결과**:
- 모던하고 반응형 채팅 인터페이스
- 부드러운 애니메이션 및 트랜지션
- 사용자 친화적인 UX 패턴

---

### 3. 📝 workthrough-v2 (개발 과정 문서화)

**추천 이유**:
- 개발 작업을 자동으로 문서화
- 무엇을 했는지, 무엇이 개선되었는지 요약
- 향후 개선 사항 제안

**활용 방안**:
각 개발 단계 완료 후 자동 실행:
- Socket.io 통합 후
- Redis 세션 관리 구현 후
- MongoDB 스키마 설계 후
- 주요 기능 완성 후

**장점**:
- 프로젝트 진행 상황 추적
- 한국어로 간결한 문서 생성
- 팀 협업 시 변경 사항 공유 용이

---

## 개발 단계별 스킬 활용 플랜

### Phase 1: 프로젝트 초기 설정
```
스킬: nextjs15-init
```
- Next.js 15 프로젝트 생성
- 기본 폴더 구조 및 설정 완료
- 필요한 라이브러리 설치

### Phase 2: 프론트엔드 UI 개발
```
스킬: frontend-design
```
- 채팅방 목록 페이지
- 채팅 메시지 인터페이스
- 로그인/회원가입 페이지
- 반응형 레이아웃

### Phase 3: 백엔드 통합
```
수동 개발 (Socket.io, Redis, MongoDB 통합)
```
- Socket.io 서버 설정
- Redis를 활용한 세션 관리 및 메시지 캐싱
- MongoDB 스키마 설계 (User, ChatRoom, Message)
- RESTful API 엔드포인트 구현

### Phase 4: 문서화
```
스킬: workthrough-v2
```
- 각 단계별 개발 내용 자동 문서화
- 기술 결정 사항 기록
- 개선 사항 제안 받기

---

## 추가 고려사항

### Socket.io + Next.js 통합
- Next.js API Routes에서 Socket.io 서버 구동
- Custom Server 설정 필요 (server.js 또는 server.ts)

### Redis 활용
- 세션 스토어
- 실시간 메시지 pub/sub
- 온라인 사용자 관리

### MongoDB 스키마 설계
```javascript
// User Schema
{
  username: String,
  email: String,
  password: String,
  avatar: String,
  createdAt: Date
}

// ChatRoom Schema
{
  name: String,
  participants: [ObjectId],
  createdAt: Date
}

// Message Schema
{
  room: ObjectId,
  sender: ObjectId,
  content: String,
  timestamp: Date
}
```

---

## 시작 방법

1. **nextjs15-init 스킬 실행**
   ```
   채팅 서비스에 최적화된 Next.js 프로젝트 생성
   ```

2. **Socket.io, Redis, MongoDB 수동 설치**
   ```bash
   npm install socket.io socket.io-client redis mongoose
   npm install -D @types/socket.io @types/redis
   ```

3. **frontend-design 스킬로 UI 컴포넌트 개발**
   ```
   채팅 인터페이스 디자인 요청
   ```

4. **개발 완료 후 workthrough-v2로 문서화**
   ```
   작업 내용 자동 정리
   ```

---

## 결론

**가장 효과적인 조합**:
1. `nextjs15-init` - 프로젝트 기반 구축
2. `frontend-design` - 고품질 UI 개발
3. `workthrough-v2` - 지속적인 문서화

이 세 가지 스킬을 활용하면 프로페셔널한 실시간 채팅 서비스를 효율적으로 개발할 수 있습니다.
