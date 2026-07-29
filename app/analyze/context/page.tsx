import ContextForm from "@/components/ContextForm";
import AnalysisStepLayout from "@/components/layout/AnalysisStepLayout";

export default function Page() {
  return <AnalysisStepLayout backHref="/" step="1 / 2" title="누구와 나눈 대화인가요?" description="관계 유형과 두 사람의 기본 맥락을 알려주시면, 같은 대화라도 상황에 맞는 기준으로 살펴봅니다.">
    <ContextForm />
  </AnalysisStepLayout>;
}
