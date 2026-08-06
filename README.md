# USAGI — AI 대화 패턴 분석

대화 텍스트 또는 메신저 캡처에서 질문, 메시지 균형, 참여 흐름과 단체톡 상호작용을 정리하는 Next.js 앱입니다. 상대방의 마음이나 성적 지향을 확정하지 않으며, 결과는 관찰 가능한 대화 패턴에 대한 참고 의견입니다.

## Version

`0.5.1 — Public Beta Stabilization`

## 주요 기능

- 카카오톡/범용 텍스트 Parser V2
- 1:1 및 단체톡 분석
- 이미지 캡처 분석과 본인 말풍선 방향 확인
- IndexedDB 기반 이미지 임시 저장
- 동일 분석 중복 실행 방지와 jobId polling
- 결과 출처·신뢰도 안내
- 한국어/영어/일본어/중국어 완전 번역
- 모바일 Safe Area 및 접근성 지원
- 생성형 AI 고지, 업로드 동의, 정책 화면
- 결과 정확도 피드백과 로컬 안정화 데이터

## 실행

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local`에 최소한 아래 값을 설정합니다.

```env
OPENAI_API_KEY=...
```

## QA

```bash
npm run qa:static
npm test
npm run typecheck
npm run build
```

전체 검증:

```bash
npm run qa
```

## 문서

구현 내용, 테스트 범위, 출시 전 체크리스트는 `USAGI_QA_REFACTOR.md`에 통합되어 있습니다.

## 개인정보 방향

- 대화와 결과는 브라우저 세션 중심으로 처리합니다.
- 압축한 이미지 초안은 IndexedDB에 임시 저장하고 분석 완료 또는 데이터 삭제 시 제거합니다.
- 앱 자체 데이터베이스나 파일 저장소에 원문을 영구 보관하는 기능은 포함하지 않습니다.
- 분석 요청은 외부 AI API로 전송됩니다.
