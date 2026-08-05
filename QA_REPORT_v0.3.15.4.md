# USAGI v0.3.15.4 QA

## 반영
- 메인 우측 상단 Language selector: 한국어 / English / 日本語 / 中文.
- 선택 언어는 localStorage(`usagi-locale`)에 저장되고 이후 분석 화면과 결과 화면에 유지됩니다.
- 분석 요청에 locale을 전달해 AI summary/highlights/friendComment도 선택 언어로 생성하도록 지시합니다.
- 홈, 3단계 입력, 캡처 업로드, 분석 로딩, 결과 주요 UI를 4개 언어로 연결했습니다.
- 내부 관계/나이/성별/질문 값은 기존 한국어 canonical value를 유지해 분석 로직과 validation 호환성을 보존하고, UI에서만 번역합니다.

## 디자인 / 아이콘 / 모션 QA
- `public/usagi-focus.png` 존재 및 RGBA 투명 채널 확인.
- `public/usagi-guide-bunny.png`는 현재 RGB 파일로 실제 alpha 채널이 없습니다. CSS는 투명 배경 전제를 따르지만, PNG 자체 배경이 포함되어 있다면 이미지 파일 교체가 필요합니다.
- `usagi-guide-bunny.svg` 구형 참조 0건.
- 안경 drop → 착용 → lens spark 애니메이션 유지.
- 단계 완료 시 spring pop + ripple + 8방향 droplet + check 모션 유지.
- `prefers-reduced-motion` 대응 유지.
- 영어/일본어/중국어에서 긴 문구가 카드 높이를 깨지 않도록 AI 친구 카드 최소 높이와 word-break를 보정했습니다.

## 로직 QA
- `scripts/check-legacy.mjs`: PASS.
- `@/` 로컬 import 누락: 0건.
- UI에서 사용 중인 번역 key 중 한국어 dictionary 누락: 0건.
- 언어 선택은 canonical 분석 데이터 자체를 변경하지 않음.
- locale은 `/api/analyze`의 AI 해석 단계에만 반영되어 FACT/metrics 계산에는 영향 없음.

## 개선 권고
1. 현재 Processing 1→4 단계는 실제 서버 progress가 아니라 1.9초 타이머 기반입니다. 기능적으로 문제는 없지만 실제 진행률처럼 오인될 수 있어 추후 `읽기/계산/AI 응답` 실제 상태 이벤트로 전환 권장.
2. 서버 오류 메시지는 일부 한국어 canonical message가 그대로 반환될 수 있습니다. 다음 단계에서 error code 기반 클라이언트 번역으로 분리 권장.
3. 한국어 외 언어에서는 MBTI 장문 성향 설명을 숨기고 공통 참고 문구를 사용합니다. 16개 MBTI 전체 설명까지 완전 현지화하려면 별도 locale profile dictionary 추가 권장.
4. 대형 PNG(약 0.7~1MB)가 여러 개 있어 첫 로딩 최적화를 위해 WebP/AVIF 또는 적정 해상도 PNG 최적화 권장.

## 검증 제한
현재 전달 ZIP에는 `node_modules`가 포함되어 있지 않아 Next/React 타입을 갖춘 실제 `npm run build` 완료 검증은 이 환경에서 수행하지 못했습니다. 전역 TypeScript 실행은 Next/React 타입 부재로 유효한 프로젝트 빌드 판정에 사용할 수 없습니다.
