import Brand from "@/components/Brand";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = {
  title: "우사기 서비스 안내",
  description: "우사기 생성형 AI 및 개인정보 처리 안내",
};

export default function PolicyPage() {
  return <main className="shell"><div className="mobile-frame policy-page">
    <Brand />
    <div className="eyebrow">서비스 안내</div>
    <h1 className="section-title">AI 분석과 데이터 처리 안내</h1>

    <section className="policy-section">
      <h2>생성형 AI 사용</h2>
      <p>우사기는 사용자가 직접 입력하거나 업로드한 대화를 생성형 AI로 구조화하고, 대화 패턴에 대한 요약과 참고 의견을 제공합니다.</p>
      <p>모든 결과 화면에는 AI가 생성한 결과임을 확인할 수 있는 라벨을 표시합니다.</p>
    </section>

    <section className="policy-section">
      <h2>결과의 한계</h2>
      <p>우사기는 상대방의 실제 감정, 의도, 호감, 성격, 성적 지향 또는 관계의 진위를 확인하거나 보장하지 않습니다.</p>
      <p>결과는 화면에서 확인되는 메시지 수, 질문, 대화 흐름 등의 패턴을 바탕으로 생성한 참고 자료이며 의료·법률·금융·심리 진단이나 전문 상담을 대체하지 않습니다.</p>
    </section>

    <section className="policy-section">
      <h2>대화와 개인정보</h2>
      <p>본인에게 이용 권한이 있는 대화만 입력해야 하며, 주민등록번호, 전화번호, 주소, 계좌번호, 건강 정보 등 민감한 개인정보는 가린 뒤 업로드해야 합니다.</p>
      <p>입력값과 결과는 현재 브라우저 세션에 저장될 수 있습니다. 동일 요청의 중복 비용을 방지하기 위해 분석 결과가 서버에 제한된 시간 동안 임시 캐시될 수 있습니다.</p>
    </section>

    <section className="policy-section">
      <h2>서비스 범위</h2>
      <p>우사기는 대화 패턴 분석 기능을 미니앱 안에서 완결적으로 제공합니다. 금융, 투자 자문, 의료, 도박, 가상자산 거래 또는 외부 앱 설치 유도 기능을 제공하지 않습니다.</p>
    </section>

    <div className="notice">서비스를 이용하면 위 내용을 확인한 것으로 봅니다. 중요한 관계 판단은 실제 대화와 당사자 간의 직접적인 소통을 우선해 주세요.</div>
    <ButtonLink href="/" variant="primary" fullWidth>홈으로 돌아가기</ButtonLink>
  </div></main>;
}
