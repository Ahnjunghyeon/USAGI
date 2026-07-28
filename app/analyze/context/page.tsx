import Link from "next/link";
import ContextForm from "@/components/ContextForm";

export default function Page(){
  return <main className="shell"><div className="mobile-frame">
    <div className="mini-nav"><Link className="back" href="/">←</Link><span className="progress">1 / 2</span></div>
    <h1 className="section-title">누구와 나눈 대화인가요?</h1>
    <p className="section-copy">관계 유형과 두 사람의 기본 맥락을 알려주시면, 같은 대화라도 상황에 맞는 기준으로 살펴봅니다.</p>
    <ContextForm />
  </div></main>
}
