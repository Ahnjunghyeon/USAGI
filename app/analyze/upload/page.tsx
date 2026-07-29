import Upload from "@/components/Upload";
import AnalysisStepLayout from "@/components/layout/AnalysisStepLayout";

export default function Page() {
  return <AnalysisStepLayout backHref="/analyze/details" step="캡처" title="이제 대화를 보여주세요" description="말풍선이 잘 보이도록 올려 주세요. 여러 장이면 시간 순서가 좋아요.">
    <Upload />
  </AnalysisStepLayout>;
}
