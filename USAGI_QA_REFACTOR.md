# USAGI v0.5.1 — Public Beta Stabilization QA

## 이번 업데이트

- 결과 화면에 정확도 피드백을 추가했습니다.
- 평가는 브라우저 로컬에 최대 30건만 저장하며 대화 원문·캡처·참가자 이름은 저장하지 않습니다.
- 1:1과 단체톡 모두 `비슷해요 / 조금 달라요 / 많이 달라요` 평가를 받을 수 있습니다.
- 낮은 평가에서는 화자 구분, 흐름 해석, AI 친구 말투, 사람별 구분 등의 원인을 선택할 수 있습니다.
- 300자 선택 의견, 중복 제출 방지, 다국어 4종, 키보드·스크린리더 상태를 지원합니다.
- 피드백 런타임 검증 테스트를 추가했고 버전을 `0.5.1`로 올렸습니다.

## 상업화 기능 경계

이번 버전은 공개 베타 안정화 버전입니다. 답장 추천·비교 분석·앱 딥링크·결제는 포함하지 않았습니다. 기본 분석 경험의 품질 데이터를 확보한 다음 독립 앱 기능으로 구현합니다.

---

## v0.5.0 기반 변경 기록

## 0. 결론

이번 버전은 v0.4.4의 기능형 MVP를 **출시 전 안정화 기반**으로 전환한 업데이트입니다. DB·상용 서버·도메인 운영은 범위에서 제외했습니다.

- 적용 버전: `0.5.0`
- 목표: 입력 신뢰성, 중복 요청 방어, 다국어 완결성, 접근성, 자산 성능, 자동 QA
- 현재 권장 공개 범위: 한국어/영어/일본어/중국어 공개 베타
- 정식 대규모 공개 전 남은 작업: 실제 기기·실제 캡처 데이터셋 검증, OpenAI 실환경 비용/지연 측정, 운영 모니터링 연결

---

## Phase A — Reliability Foundation

### A-1. 다국어 완전 동기화

`lib/i18n.ts`의 KO/EN/JA/ZH를 모두 독립적인 212개 키로 구성했습니다.

- 일본어·중국어의 `...EN` 상속 제거
- 정책 페이지 4개 언어 완전 번역 및 언어 전환 동기화
- 한국어 변경 문구를 나머지 언어에 동기화
- 공유 문구, 오류, 접근성 라벨, 이미지 말풍선 방향, 분석 품질 안내 추가
- `<br>` 및 번역 문자열 내부 강제 개행 금지
- 텍스트 입력 예시도 선택 언어에 맞춰 표시
- `MessageKey` 기반 키 타입 유지

검증 명령:

```bash
npm run qa:i18n
```

### A-2. 저장 데이터 안정화

- `sessionStorage` 값에 버전 envelope 적용
- 구버전 raw JSON 자동 마이그레이션
- Context/Input/Result 런타임 검증 추가
- 결과의 `source`, `groupAnalysis` 구조 검증 추가
- 대형 base64 이미지는 `sessionStorage`에서 제거
- 이미지 임시 저장소를 IndexedDB(`imageDraftStore`)로 전환

### A-3. 코드 중복 제거

- 이미지 압축을 `lib/client/image-upload.ts`로 단일화
- 서버 입력/스키마: `lib/server/analyze-contract.ts`
- 서버 오류/후처리: `lib/server/analysis-copy.ts`
- 결과 CSS: `styles/report.css` 단일 소유
- 공통 UI: Button/Card/Badge/FormControls/BottomSheet/Toast/NaturalText
- 사용되지 않던 `lib/conversation-parser.ts`, `lib/friend.ts`, dataset cache 함수 제거
- `public/temp`, `public/ai-friends/temp` 제거

### A-4. CI 및 정적 QA

`.github/workflows/ci.yml`을 추가했습니다. Push/PR 시 다음을 실행합니다.

```bash
npm ci
npm run qa
```

정적 QA 구성:

- TypeScript/TSX 구문 검사
- 로컬 alias import 검사
- 4개 언어 키 검사
- CSS 중요 selector 소유권 검사
- 접근성 계약 검사
- 이미지 자산 용량 검사
- Legacy/Mock 검사
- 릴리스 필수 파일 검사
- 핵심 단위 테스트
- TypeScript typecheck
- Next.js production build

---

## Phase B — Input & Analysis Reliability

### B-1. Text Parser V2

지원 형식:

```text
[홍길동] [오전 10:23] 안녕
[Kim] [10:23 AM] Hello
[Kim] [AM 10:23] Hello
[Kim] [22:03] Hello
2026년 8월 6일 오후 3:00, 홍길동 : 안녕
Kim: Hello
Kim - Hello
Kim, 10:23 AM: Hello
```

추가 처리:

- 카카오톡 여러 줄 메시지 결합
- 날짜/시스템 구분선 제외
- 일반 메모를 대화로 잘못 인식하는 오탐 방어
- 참가자 반복 조건 확인
- parser confidence와 warnings 저장
- 화면 예시와 실제 parser 형식 일치

### B-2. 이미지 본인 말풍선 확인

업로드 화면에서 사용자가 직접 선택합니다.

- 오른쪽 말풍선이 나
- 왼쪽 말풍선이 나
- 자동 판단

자동 판단이 불확실하면 분석을 중단하고 직접 선택하도록 안내합니다. AI가 본인을 반대로 판단해 모든 지표가 뒤집히는 위험을 줄였습니다.

### B-3. 이미지 저장 및 처리

- 최대 5장
- JPEG/PNG/WebP만 허용
- 모바일 메모리 사용량을 줄이기 위해 순차 압축
- 최대 폭·총 base64 크기 제한
- 압축한 이미지를 IndexedDB에 임시 저장
- 용량/형식/저장 실패를 구체적인 사용자 오류로 표시

### B-4. 중복 요청과 대용량 재전송 방지

기존에는 동일 요청이 처리 중일 때 이미지 payload가 반복 전송될 수 있었습니다.

현재 흐름:

```text
최초 POST /api/analyze
→ 중복 작업이면 202 + jobId
→ GET /api/analyze/status?jobId=...
→ jobId만 polling
→ 완료 결과 수신
```

대형 base64 이미지는 최초 요청에서만 전송합니다.

### B-5. 결과 출처와 품질 표시

각 결과에 `source`를 저장합니다.

- 입력 유형: text/image
- parser: kakao/generic/vision
- confidence: high/medium/low
- 참가자 이름
- 본인 말풍선 방향
- warnings

결과 화면에는 분석 기준과 데이터가 적거나 불확실한 경우의 품질 안내를 표시합니다.

---

## Phase C — UX, Accessibility & Performance

### C-1. 접근성

- Label과 input/select를 `htmlFor`/`id`로 연결
- 도움말·오류를 `aria-describedby`로 연결
- 오류 필드 `aria-invalid`
- 입력 방식 탭에 tablist/tab/tabpanel 적용
- 키보드 Arrow/Home/End 이동 지원
- BottomSheet focus trap, ESC 닫기, 기존 focus 복귀
- ProgressHeader에 progressbar semantics 적용
- 선택 버튼에 `aria-pressed`
- 동작 완료는 `window.alert` 대신 Toast/live region 사용
- 이미지 이동·삭제 버튼에 구체적인 aria-label 적용
- reduced-motion 및 forced-colors 대응

### C-2. 텍스트와 개행

- 번역 문자열에 HTML `<br>`를 넣지 않음
- 번역 문자열 내부 강제 `\n` 제거
- `NaturalText`와 `word-break: keep-all` 사용
- 단어 중간이 `알려주\n세요`처럼 끊기지 않도록 처리
- 실제 작은 화면에서만 자연스럽게 줄바꿈

### C-3. 색상 대비

작은 텍스트에 사용되던 밝은 핑크를 기능성 진한 핑크로 조정했습니다.

- Primary: `#b93859`
- Strong accent text: `#a73552`
- Secondary text: `#59636f`
- Focus ring 대비 강화

브랜드의 밝은 분홍색은 배경 surface에 유지하고, 읽어야 하는 글자와 상태에는 진한 색을 사용합니다.

### C-4. 이미지 성능

기존 public 자산은 약 18MB였고, 작은 아바타에도 1~2MB PNG를 사용했습니다.

현재:

- UI용 이미지를 160~360px WebP로 파생
- 친구 아바타를 320px WebP로 변환
- 임시/중복 PNG 제거
- public 자산 총량 약 94KB

등록용 앱 아이콘은 `app/icon.png`, `app/apple-icon.png`로 별도 유지합니다.

---

## Phase D — Release Verification

### D-1. 자동 테스트

총 26개 핵심 단위 테스트를 추가했습니다.

- 한국어 오전/오후 parser
- 영어 AM/PM parser
- 일본어·중국어 오전/오후 표기
- 24시간제 parser
- 여러 줄 메시지
- 날짜 구분선
- 일반 `이름: 메시지`
- timestamp generic 형식
- 일반 메모 오탐 방지
- 참가자 부족 거부
- 카카오톡 내보내기 날짜 형식
- 참가자 입장 시스템 메시지 제외
- 메시지 밸런스
- 질문/웃음/이모지 지표
- 영어·일본어·중국어 질문/웃음 표현 지표
- 중복 제거
- 데이터량 구간
- 단체톡 interaction
- group → binary 변환
- 저장 Context/Input/Result 런타임 스키마 검증

실행:

```bash
npm test
```

### D-2. 로컬 및 CI 최종 명령

```bash
npm ci
npm run qa
```

`npm run qa`는 정적 QA, 테스트, typecheck, production build까지 포함합니다.

### D-3. 실제 출시 전 수동 테스트 체크리스트

#### 텍스트

- [ ] 한국어 카카오톡 복사
- [ ] 영어 AM/PM 카카오톡 복사
- [ ] 24시간제
- [ ] 1:1 / 3명 / 5명 단체톡
- [ ] 여러 줄 메시지
- [ ] 일반 메모 입력 거부
- [ ] 12만 자 초과 오류

#### 이미지

- [ ] 오른쪽이 본인
- [ ] 왼쪽이 본인
- [ ] 자동 판단 성공/실패
- [ ] 이름이 보이지 않는 이미지
- [ ] 잘린 이미지
- [ ] 1장/5장/6장
- [ ] PNG/JPEG/WebP/미지원 형식
- [ ] 정렬/삭제/재시도

#### 상태

- [ ] 분석 버튼 빠른 연속 클릭
- [ ] 동일 요청 두 탭
- [ ] 분석 중 취소
- [ ] 분석 중 새로고침
- [ ] OpenAI 429/500/불완전 JSON
- [ ] sessionStorage/IndexedDB 사용 불가 환경

#### 화면/접근성

- [ ] 360/375/390/430px
- [ ] iPhone Safari
- [ ] 저사양 Android Chrome
- [ ] 키보드만으로 전체 흐름
- [ ] VoiceOver 또는 TalkBack
- [ ] 브라우저 200% 확대
- [ ] Reduce Motion

#### 다국어

- [ ] KO/EN/JA/ZH 모든 페이지
- [ ] 오류 화면
- [ ] 결과 공유
- [ ] 정책 화면
- [ ] 언어 변경 후 새로고침

---

## 변경 파일 요약

### 신규

- `app/api/analyze/status/route.ts`
- `components/ui/Toast.tsx`
- `lib/client/image-draft-store.ts`
- `lib/server/analyze-contract.ts`
- `lib/server/analysis-copy.ts`
- `styles/accessibility.css`
- `tests/chat-text.test.ts`
- `tests/analysis.test.ts`
- `scripts/check-syntax.mjs`
- `scripts/check-imports.mjs`
- `scripts/check-css.mjs`
- `scripts/check-a11y.mjs`
- `scripts/check-assets.mjs`
- `scripts/check-release.mjs`
- `.github/workflows/ci.yml`

### 주요 수정

- `app/api/analyze/route.ts`
- `components/ConversationInput.tsx`
- `components/Upload.tsx`
- `components/Processing.tsx`
- `components/Report.tsx`
- `components/ContextForm.tsx`
- `components/DetailsForm.tsx`
- `components/ui/FormControls.tsx`
- `components/ui/BottomSheet.tsx`
- `components/ui/ProgressHeader.tsx`
- `lib/chat-text.ts`
- `lib/analysis.ts`
- `lib/client/storage.ts`
- `lib/i18n.ts`
- `lib/request-manager.ts`
- `styles/*`
- `package.json`

### 제거

- `QA.md`
- `Refactoring Log.md`
- `lib/conversation-parser.ts`
- `lib/friend.ts`
- `public/temp`
- `public/ai-friends/temp`
- 대용량 원본 UI PNG

---

## 현재 검증 결과

이 작업 환경에서 확인한 결과:

- TypeScript/TSX 구문 검사: 통과
- alias import 검사: 통과
- i18n 212키 × 4개 언어: 통과
- CSS 중요 selector 소유권: 통과
- 정적 접근성 계약: 통과
- 자산 용량: 통과, 약 94KB
- Legacy 파일 검사: 통과
- Release foundation 검사: 통과
- 단위 테스트: 26/26 통과

이 작업 환경의 내부 npm 저장소에 `undici-types@6.21.0` 파일이 없어 `npm ci`, 전체 TypeScript typecheck, Next.js production build는 완료하지 못했습니다. 로컬 또는 GitHub Actions에서 `npm run qa`를 반드시 최종 통과해야 합니다.
