export default function ProcessingMascot({ stage = 0 }: { stage?: number }) {
  return (
    <div className={`processing-mascot stage-${stage + 1}`} aria-live="polite">
      <div className="processing-mascot-orbit" aria-hidden="true">
        <div className="analysis-bunny">
          <span className="bunny-ear bunny-ear-left"><i /></span>
          <span className="bunny-ear bunny-ear-right"><i /></span>
          <span className="bunny-body">
            <span className="bunny-eye bunny-eye-left" />
            <span className="bunny-eye bunny-eye-right" />
            <span className="bunny-mouth" />
            <span className="bunny-cheek bunny-cheek-left" />
            <span className="bunny-cheek bunny-cheek-right" />
            <span className="bunny-paw bunny-paw-left" />
            <span className="bunny-paw bunny-paw-right" />
          </span>
          <div className="analysis-glasses">
            <span className="lens lens-left" />
            <span className="lens lens-right" />
            <span className="glasses-bridge" />
            <span className="glasses-arm glasses-arm-left" />
            <span className="glasses-arm glasses-arm-right" />
          </div>
          <span className="lens-spark spark-one">✦</span>
          <span className="lens-spark spark-two">✧</span>
        </div>
      </div>
      <strong>{stage < 3 ? "우사기가 대화를 열심히 보고 있어요" : "거의 다 봤어요. 한마디만 정리할게요"}</strong>
      <span>데이터는 진지하게, 결과는 재밌게.</span>
    </div>
  );
}
