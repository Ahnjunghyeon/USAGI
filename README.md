# 우사기 v0.3.5 — Vercel Preview Ready QA

대화 캡처를 AI Vision으로 구조화하고, TypeScript Metrics Engine으로 FACT를 계산한 뒤 선택한 AI 친구가 친근하게 정리하는 모바일 퍼스트 웹 MVP입니다.

## 로컬 실행

```powershell
npm ci
Copy-Item .env.example .env.local
npm run qa
npm run dev
```

`.env.local` 예시:

```env
OPENAI_API_KEY=sk-본인의_API_KEY
OPENAI_VISION_MODEL=gpt-5-mini
OPENAI_ANALYSIS_MODEL=gpt-5.4-mini

# 공개 트래픽 전에 권장
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
USAGI_SAFETY_SALT=충분히_긴_랜덤_문자열
```

`.env.local`은 GitHub에 올리지 마세요. `.gitignore`에 제외되어 있습니다.

## GitHub 업데이트

이미 clone된 저장소에서는 `git init`을 다시 하지 않습니다.

```powershell
npm ci
npm run qa

git status
git add .
git status
git commit -m "Release Usagi v0.3.5 Preview QA"
git push
```

`git status`에서 `.env.local`, `node_modules`, `.next`, `*.tsbuildinfo`가 staging에 포함되지 않았는지 반드시 확인하세요.

## Vercel Preview 배포

Vercel → Project → Settings → Environment Variables에 아래 값을 등록합니다.

필수:
- `OPENAI_API_KEY`
- `OPENAI_VISION_MODEL=gpt-5-mini`
- `OPENAI_ANALYSIS_MODEL=gpt-5.4-mini`

권장:
- `USAGI_SAFETY_SALT`: 긴 랜덤 비밀 문자열

릴스 등 공개 트래픽 전에 추가 권장:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

환경변수 추가/수정 후 반드시 Redeploy 하세요.

## v0.3.5 주요 QA 변경

- 남아 있던 `/report/demo`, `ReportDemo`, `UploadMock` 실제 삭제
- OpenAI 오류의 HTTP status/code/type 보존
- `insufficient_quota`, rate limit, API key/model 권한 오류를 사용자 UX와 운영 로그에서 분리
- AI 친구 한마디 서버 길이 상한을 260자로 축소
- MBTI 피드백이 다음 분석에 자동 학습되는 것처럼 보이던 문구 제거
- 인메모리 Rate Limit 오래된 IP bucket 정리
- Upstash Redis REST 환경변수가 있으면 Vercel 인스턴스 간 공유 Rate Limit 사용
- Upstash가 없거나 장애가 나면 테스트용 인메모리 Rate Limit으로 fallback
- privacy-preserving `safety_identifier`를 OpenAI 요청에 추가
- `.next`, `*.tsbuildinfo`, 환경변수 파일을 배포 소스에서 제외

## Rate Limit

기본 제한:
- IP당 1분 3회
- IP당 1시간 20회

Upstash 환경변수가 설정되어 있으면 분산 Rate Limit을 사용합니다. 설정되지 않은 경우 메모리 fallback을 사용하므로 Vercel Preview/소규모 테스트용으로만 간주하세요.

## 배포 체크리스트

- [ ] `npm ci`
- [ ] `npm run qa`
- [ ] `.env.local` Git 제외 확인
- [ ] OpenAI API Billing 활성화 확인
- [ ] Vercel 환경변수 설정
- [ ] 모바일 실기기에서 1장/3장/5장 캡처 분석
- [ ] OpenAI quota/rate-limit 오류 UX 확인
- [ ] Vercel 로그에서 `[usagi/usage]` 토큰 사용량 확인
- [ ] 릴스 공개 전 Upstash Rate Limit 연결

상세 변경 이력은 `앱의 리팩토링.md` 하나에 누적합니다.
