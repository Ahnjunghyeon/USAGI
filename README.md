# 우사기 v0.3.4 — Production Safety & Reliability QA

대화 캡처를 AI Vision으로 구조화하고, TypeScript Metrics Engine으로 FACT를 계산한 뒤 선택한 AI 친구가 친근하게 정리하는 모바일 퍼스트 웹 MVP입니다.

## 로컬 실행

```powershell
npm install
Copy-Item .env.example .env.local
npm run typecheck
npm run build
npm run dev
```

`.env.local`:

```env
OPENAI_API_KEY=sk-본인의_API_KEY
OPENAI_VISION_MODEL=gpt-5-mini
OPENAI_ANALYSIS_MODEL=gpt-5.4-mini
```

`.env.local`은 GitHub에 올리지 마세요. `.gitignore`에 제외되어 있습니다.

## GitHub 업로드

프로젝트 루트에서:

```powershell
git init
git add .
git status
git commit -m "Release Usagi v0.3.4 QA"
git branch -M main
git remote add origin https://github.com/<USER>/<REPOSITORY>.git
git push -u origin main
```

기존 저장소가 연결돼 있다면 `git init`, `remote add`는 생략하고:

```powershell
git add .
git commit -m "Release Usagi v0.3.4 QA"
git push
```

`git status`에서 `.env.local`, `node_modules`, `.next`가 staging에 포함되지 않았는지 반드시 확인하세요.

## Vercel 테스트 배포

1. Vercel에서 GitHub 저장소를 Import합니다.
2. Framework Preset은 Next.js 자동 감지를 사용합니다.
3. Project → Settings → Environment Variables에서 아래 값을 등록합니다.
   - `OPENAI_API_KEY`
   - `OPENAI_VISION_MODEL=gpt-5-mini`
   - `OPENAI_ANALYSIS_MODEL=gpt-5.4-mini`
4. Production / Preview / Development 중 필요한 환경에 체크합니다.
5. Deploy 후 실제 모바일 기기에서 캡처 업로드 → 분석 → 결과 → 공유까지 확인합니다.

환경변수를 추가/수정했다면 반드시 Redeploy해야 합니다.

## v0.3.4 주요 QA 개선

- Demo/Mock 라우트와 컴포넌트 제거
- 서버 Runtime Validation
- 서버 이미지 크기/개수 제한
- IP Rate Limit (1분 3회 / 1시간 20회)
- OpenAI Structured Outputs JSON Schema
- Prompt Injection 방어
- AI 출력 토큰 제한
- `신뢰도` → `데이터량` 표현으로 수정
- 캡처 순서 ↑/↓ 변경
- 메시지 중복 2차 제거
- production 오류 내부정보 숨김
- AI token usage 서버 로그 추가

## Rate Limit 주의
현재 Rate Limit은 서버 프로세스 메모리에 저장됩니다. Vercel 테스트 배포와 소규모 테스트용으로는 방어층이 되지만, 여러 Function 인스턴스가 뜨면 전역 카운터가 공유되지 않습니다. 릴스 바이럴 등 공개 트래픽을 받기 전에는 Redis/KV 같은 공유 저장소 기반 Rate Limit으로 교체하세요.

상세 변경 및 QA 기록은 `앱의 리팩토링.md`만 사용합니다.
