# Claude Code `/compact` 완전 가이드

## 📌 핵심 요약

`/compact` 명령어는 대화 내역을 압축하여 토큰 사용량을 줄이면서도 중요한 컨텍스트는 보존합니다.

---

## ⚠️ 블로그 vs 실제 기능

### 블로그에서 설명한 기능 (실제로는 없음)
```bash
# ❌ 이런 옵션들은 실제로 존재하지 않습니다
claude-code /compact --level 1
claude-code /compact --remove-comments
claude-code /compact --files "*.js"
claude-code /compact --compress-types
```

### 실제 Claude Code 기능 (간단하고 강력함)
```bash
# ✅ 실제로 사용 가능한 방법들
/compact
/compact focus on API implementation
/compact keep Socket.io changes, remove setup discussions
```

---

## 🚀 실제 사용법

### 1. 기본 압축
```bash
/compact
```
- 대화 내역을 자동으로 요약
- 중요한 코드 변경사항과 결정사항 보존
- 불필요한 중간 과정 제거

### 2. 커스텀 지시사항과 함께
```bash
# API 구현에 집중, UI 변경사항은 제외
/compact focus on the API implementation and skip UI changes

# 데이터베이스 스키마와 에러 수정만 유지
/compact keep only the database schema changes and error fixes

# Socket.io 구현 보존, 초기 설정 논의 제거
/compact preserve Socket.io implementation, remove initial setup discussions

# 특정 파일 관련 변경사항만 유지
/compact focus on changes to server.ts and socket-context.tsx
```

### 3. 압축 후 확인
```bash
# Ctrl+O를 눌러 압축된 요약 내용 확인 가능
```

---

## 🔄 자동 압축 설정 (PreCompact Hook)

### 설정 파일 위치
- **프로젝트별**: `.claude/settings.json` (이 프로젝트에 적용)
- **전역**: `~/.claude/settings.json` (모든 프로젝트에 적용)

### 현재 프로젝트 설정 (이미 적용됨)

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[자동 압축] 컨텍스트 윈도우 한계로 인한 자동 압축 - $(date)' >> .claude/compact-history.log"
          }
        ]
      },
      {
        "matcher": "manual",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[수동 압축] 사용자 요청에 의한 압축 - $(date)' >> .claude/compact-history.log"
          }
        ]
      }
    ]
  }
}
```

### Hook 동작 방식

#### 1. Auto Trigger (자동)
- 컨텍스트 윈도우가 가득 찰 때 자동 실행
- 사용자 개입 없이 백그라운드에서 작동

#### 2. Manual Trigger (수동)
- `/compact` 명령어로 직접 실행
- 커스텀 지시사항 전달 가능

---

## 📊 Hook 고급 설정 예제

### 1. 압축 전 백업 생성
```json
{
  "matcher": "manual",
  "hooks": [
    {
      "type": "command",
      "command": "cp ~/.claude/projects/*/transcript.jsonl ~/.claude/backups/transcript-$(date +%Y%m%d-%H%M%S).jsonl"
    }
  ]
}
```

### 2. 압축 방지 조건 설정
```json
{
  "matcher": "auto",
  "hooks": [
    {
      "type": "command",
      "command": "node check-if-should-compact.js",
      "output": {
        "continue": false,
        "systemMessage": "Important work in progress, skipping auto-compact"
      }
    }
  ]
}
```

### 3. 압축 알림 전송
```json
{
  "matcher": "auto",
  "hooks": [
    {
      "type": "command",
      "command": "curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK -d '{\"text\":\"Claude session auto-compacted\"}'"
    }
  ]
}
```

---

## 💡 실전 활용 팁

### 언제 `/compact`를 사용해야 할까?

#### ✅ 사용하면 좋은 경우
1. **대화가 길어졌을 때** (50+ 메시지)
2. **작업 단계가 바뀔 때** (설계 → 구현 → 테스트)
3. **초기 논의가 더 이상 필요없을 때**
4. **특정 기능 구현이 완료되었을 때**

#### ❌ 사용하지 말아야 할 경우
1. **현재 작업 중인 코드를 참조해야 할 때**
2. **에러 디버깅 중일 때** (전체 컨텍스트 필요)
3. **복잡한 멀티스텝 작업 진행 중**

### 효과적인 압축 지시사항 작성법

```bash
# ❌ 나쁜 예 (모호함)
/compact make it smaller

# ✅ 좋은 예 (구체적)
/compact keep Socket.io implementation and user authentication, remove initial Next.js setup

# ✅ 더 좋은 예 (파일 명시)
/compact preserve changes to server.ts, components/messages/*, and lib/contexts/socket-context.tsx
```

---

## 📈 토큰 절약 전략

### 1. 정기적 압축
```bash
# 작업 단계마다 압축
/compact focus on completed features

# 예: Socket.io 구현 완료 후
/compact Socket.io implementation done, keep only the working code
```

### 2. 선택적 컨텍스트 유지
```bash
# 특정 영역만 유지
/compact keep backend changes, remove frontend discussions

# 특정 파일만 유지
/compact preserve server.ts and socket handlers only
```

### 3. 압축 히스토리 관리
```bash
# 로그 확인
cat .claude/compact-history.log

# 출력 예시:
# [수동 압축] 사용자 요청에 의한 압축 - 2025-12-12 14:30:22
# [자동 압축] 컨텍스트 윈도우 한계로 인한 자동 압축 - 2025-12-12 15:45:10
```

---

## 🔍 관련 명령어

```bash
# 현재 컨텍스트 사용량 확인
/context

# 토큰 비용 확인
/cost

# 세션 초기화 (완전히 새로 시작)
/clear

# 이전 세션 재개
/resume

# 영구 메모리 생성 (압축 후에도 유지)
/memory add "Socket.io uses port 3333 and handles message:send events"
```

---

## 📝 현재 프로젝트에 적용된 설정

이 프로젝트는 이미 다음 설정이 적용되어 있습니다:

1. ✅ PreCompact hook 설정 완료
2. ✅ Auto/Manual 트리거 로깅 활성화
3. ✅ 압축 히스토리 `.claude/compact-history.log`에 기록

### 테스트 방법
```bash
# 수동 압축 테스트
/compact

# 로그 확인
cat .claude/compact-history.log
```

---

## 🎯 결론

- **블로그의 고급 옵션들은 이상적인 제안**이지만 실제로는 없음
- **실제 `/compact`는 더 단순하지만 충분히 강력함**
- **커스텀 지시사항으로 원하는 컨텍스트 보존 가능**
- **PreCompact hook으로 자동화 및 로깅 가능**
- **정기적인 압축으로 토큰 비용 절감**

---

## 📚 추가 리소스

- Claude Code 공식 문서: [claude.com/code](https://claude.com/code)
- Hook 설정 가이드: `claude-code help hooks`
- 컨텍스트 관리: `claude-code help context`
