# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - img [ref=e7]
    - heading "Real Chat" [level=1] [ref=e9]
    - paragraph [ref=e10]: 로그인하여 채팅을 시작하세요
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: 이메일
        - textbox "이메일" [ref=e14]:
          - /placeholder: example@email.com
          - text: ongsya@gmail.com
      - generic [ref=e15]:
        - generic [ref=e16]: 비밀번호
        - textbox "비밀번호" [ref=e17]:
          - /placeholder: ••••••
          - text: "1"
      - generic [ref=e18]: 이메일 또는 비밀번호가 올바르지 않습니다
      - button "로그인" [ref=e19] [cursor=pointer]
    - generic [ref=e20]:
      - text: 계정이 없으신가요?
      - link "회원가입" [ref=e21] [cursor=pointer]:
        - /url: /auth/register
  - generic [ref=e26] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e27]:
      - img [ref=e28]
    - generic [ref=e31]:
      - button "Open issues overlay" [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: "0"
          - generic [ref=e35]: "1"
        - generic [ref=e36]: Issue
      - button "Collapse issues badge" [ref=e37]:
        - img [ref=e38]
  - alert [ref=e40]
```