export default function ProcessingMascot({ stage = 0 }: { stage?: number }) {
  return (
    <div className={`processing-mascot stage-${stage + 1}`} aria-live="polite">
      <div className="processing-mascot-orbit" aria-hidden="true">
        <div className="analysis-bunny analysis-bunny-image">
          <img className="analysis-bunny-base" src="/usagi-guide-bunny.png" alt="" width={150} height={150}/>
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
      <strong>{stage < 3 ? "우사기가 대화를 열심히 보고 있어요" : "거의 다 봤어요. 핵심만 정리할게요"}</strong>
      <span>{stage < 3 ? "데이터는 진지하게, 결과는 재밌게." : "답변을 짧고 선명하게 다듬는 중이에요."}</span>
    </div>
  );
}
