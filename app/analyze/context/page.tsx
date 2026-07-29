import ContextForm from "@/components/ContextForm";
import AnalysisStepLayout from "@/components/layout/AnalysisStepLayout";

export default function Page() {
  return <AnalysisStepLayout backHref="/analyze" step="2 / 3" title="어떤 사이인지 알려주세요" description="관계와 궁금한 점만 알면 우사기가 훨씬 자연스럽게 볼 수 있어요.">
    <ContextForm />
  </AnalysisStepLayout>;
}
