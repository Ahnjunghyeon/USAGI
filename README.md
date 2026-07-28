# 우사기 v0.3.6 — Cost Guard & Cancel QA

대화 캡처를 AI Vision으로 구조화하고 TypeScript Metrics Engine으로 FACT를 계산한 뒤, 선택한 AI 친구가 친근하게 정리하는 모바일 퍼스트 웹 MVP입니다.

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
OPENAI_ANALYSIS_MODEL=gpt-5.4-nano

# 공개 트래픽 전에 권장
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
USAGI_REQUIRE_DISTRIBUTED_GUARD=false
USAGI_SAFETY_SALT=충분히_긴_랜덤_문자열

# 비용 보호 한도
USAGI_IP_MINUTE_LIMIT=2
USAGI_IP_HOUR_LIMIT=5
USAGI_IP_DAILY_LIMIT=10
USAGI_GLOBAL_DAILY_LIMIT=100
```

`.env.local`은 GitHub에 올리지 마세요.

## v0.3.6 핵심 변경

- 처리 4단계 지연/비용 완화
  - 최종 narrative 기본 모델을 `gpt-5.4-nano`로 변경
  - 최종 대화 sample 최대 48개로 축소
  - narrative 최대 출력 420 tokens
  - Vision 최대 출력 4500 tokens
  - 두 단계 모두 reasoning effort `none`
  - `[usagi/usage]` 로그에 Vision/Analysis 각각의 소요시간 추가
- 분석 취소 버튼
  - 브라우저 fetch를 `AbortController`로 중단
  - 서버에서 `request.signal`을 OpenAI fetch까지 전달
  - Vision 종료 후 취소 상태를 다시 확인하여 두 번째 AI 호출 방지
  - 취소 시 sessionStorage의 캡처/결과 제거
- 비용/악용 방어
  - IP: 기본 1분 2회 / 1시간 5회 / 하루 10회
  - 동일 IP 동시 분석 1개 제한
  - 전체 서비스 하루 분석 횟수 기본 100회 하드캡
  - Upstash 연결 시 모든 Vercel 인스턴스가 같은 제한/하드캡 사용
  - `USAGI_REQUIRE_DISTRIBUTED_GUARD=true`이면 Upstash 장애/미설정 시 분석을 차단하여 비용 보호
- 오래 남아 있던 Demo/Mock 코드 실제 삭제

## 취소와 API 비용

분석 취소는 **남은 요청을 최대한 빨리 중단**하도록 구현되어 있습니다. 다만 OpenAI 요청이 이미 서버에서 처리되기 시작한 뒤 취소한 경우, 그 시점까지 처리된 API 사용량은 발생할 수 있습니다. 따라서 "취소 버튼을 누르면 이미 사용된 토큰까지 0원"을 기술적으로 보장하지는 않습니다.

비용 보호의 핵심은 취소 기능과 별개로 **분산 Rate Limit + 동일 사용자 동시 요청 차단 + 서비스 전체 일일 하드캡**입니다.

## Vercel 공개 전 권장 설정

1. Upstash Redis를 생성합니다.
2. Vercel Environment Variables에 아래를 등록합니다.
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `USAGI_REQUIRE_DISTRIBUTED_GUARD=true`
3. 초기 테스트에서는 `USAGI_GLOBAL_DAILY_LIMIT=50~100` 정도로 보수적으로 운영합니다.
4. 실제 `[usagi/usage]` 로그의 평균 비용을 측정한 뒤 한도를 조정합니다.

## GitHub 업데이트

```powershell
npm ci
npm run qa

git status
git add .
git status
git commit -m "Release Usagi v0.3.6 cost guard QA"
git push origin main
```

`git status`에서 `.env.local`, `node_modules`, `.next`, `*.tsbuildinfo`가 staging에 포함되지 않았는지 확인하세요.

## 배포 체크리스트

- [ ] `npm ci`
- [ ] `npm run qa`
- [ ] `.env.local` Git 제외 확인
- [ ] OpenAI Billing/Credit 확인
- [ ] Vercel 환경변수 등록 후 Redeploy
- [ ] 1장/3장/5장 캡처 처리 시간과 토큰 로그 비교
- [ ] 처리 중 `분석 취소하기` 동작 확인
- [ ] 같은 브라우저에서 동시 분석 차단 확인
- [ ] IP rate limit 확인
- [ ] 전역 일일 하드캡 확인
- [ ] 릴스 공개 전 Upstash + `USAGI_REQUIRE_DISTRIBUTED_GUARD=true`

상세 변경 이력은 `앱의 리팩토링.md` 하나에 누적합니다.


## v0.3.7 QA 메모
AI 친구의 한마디가 서로 다른 캡처에서 반복되는 문제를 줄이기 위해 대화별 신호와 스타일 힌트를 추가했습니다. 추가 AI 호출은 없으며 v0.3.6의 비용/속도 최적화 구조를 유지합니다.

### v0.3.11
AI 친구 프리셋 나이대 동기화와 프리셋 선택 UI 중복 제거를 적용했습니다.

### v0.3.12
AI 친구 프리셋 중복 카드 제거와 모바일 선택 UI QA를 적용했습니다.
