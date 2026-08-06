# USAGI v0.4.4 — i18n · DRY · Text Layout · Card UX QA

## 적용 범위
- 한국어 변경 문구를 영어·일본어·중국어 UX 문구에 동기화
- 임시 문구 `제거 예정`, `parseOk:("" as any)` 제거
- i18n 키 타입을 `MessageKey`로 제한
- `npm run qa:i18n` 검증 스크립트 추가
- 의미 없는 `<br />` 기반 배치를 Grid/Flex 텍스트 구조로 변경
- 인라인 스타일을 재사용 가능한 CSS class로 이동
- 공통 Card/Badge 스타일을 `styles/components.css`로 단일화
- 결과 페이지 스타일은 `styles/report.css`가 단독 소유
- 오래된 v0.4.1/v0.4.2 compatibility CSS 제거

## 주요 문구 개선
- `Language` → 언어별 현지 표기
- `우사기 친구` → `AI 친구`
- `우사기는 알고싶어요!` → `우사기가 먼저 살펴볼게요 👀`
- 분석 로딩 문구를 기계적인 계산 표현보다 사용자가 이해하기 쉬운 흐름 표현으로 변경
- 결과 하단 고지를 짧은 참고 안내로 정리

## 텍스트/개행 원칙
- 번역 문자열에 `<br>` HTML을 넣지 않음
- 강제 줄바꿈이 필요한 제목은 문장을 별도 요소로 나눔
- 일반 문장은 `word-break: keep-all`과 자연스러운 컨테이너 폭으로 처리
- 숫자 비교/레이블은 `<br>` 대신 Grid row 사용

## DRY 정리
- `NaturalText.tsx`: 언어별 자연스러운 줄바꿈 공통 처리
- `styles/components.css`: Card/Badge 및 공통 텍스트 배치 단일 소유
- Upload 컴포넌트의 인라인 스타일 제거
- 기존 결과/카드 중복 CSS 제거

## QA
```powershell
npm run qa
```

검증 대상:
- i18n 기본 키와 EN 키 동기화
- TypeScript
- Next.js production build
- legacy Demo/Mock 검사

## 화면 수동 점검
- 360 / 375 / 390 / 430px
- 한국어·영어·일본어·중국어 전환
- 제목 중간 단어가 부자연스럽게 끊기지 않는지
- 카드 본문 대비 및 버튼 hover/focus/pressed 상태
