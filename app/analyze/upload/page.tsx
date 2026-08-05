import Upload from "@/components/Upload";import AnalysisStepLayout from "@/components/layout/AnalysisStepLayout";
export default function Page(){return <AnalysisStepLayout backHref="/analyze/details" step="CAPTURE" titleKey="uploadTitle" descriptionKey="uploadDesc"><Upload/></AnalysisStepLayout>}
