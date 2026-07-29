import Upload from "@/components/Upload";
import AnalysisStepLayout from "@/components/layout/AnalysisStepLayout";

export default function Page() {
  return <AnalysisStepLayout backHref="/analyze/context" step="2 / 2" title="대화를 보여주세요" description="말풍선이 잘 보이도록 캡처해 주세요. 여러 장이면 시간 순서대로 선택하는 것을 권장합니다.">
    <Upload />
  </AnalysisStepLayout>;
}
