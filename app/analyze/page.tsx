import AnalysisStepLayout from "@/components/layout/AnalysisStepLayout";
import ConversationInput from "@/components/ConversationInput";

export default function Page(){
  return <AnalysisStepLayout backHref="/" step="1 / 3" title="대화부터 보여주세요" description="카카오톡은 복사해서 붙여넣는 게 가장 빠르고, 캡처만 있어도 괜찮아요.">
    <ConversationInput />
  </AnalysisStepLayout>;
}
