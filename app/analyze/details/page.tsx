import DetailsForm from "@/components/DetailsForm";
import AnalysisStepLayout from "@/components/layout/AnalysisStepLayout";

export default function Page(){
  return <AnalysisStepLayout backHref="/analyze/context" step="3 / 3" title="마지막으로 조금만 더" description="모르는 정보는 건너뛰어도 괜찮아요. 우사기는 실제 대화를 가장 먼저 봅니다.">
    <DetailsForm />
  </AnalysisStepLayout>;
}
