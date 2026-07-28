import Image from "next/image";

type Variant = "stealth" | "focus" | "data" | "pattern" | "relation";
const META: Record<Variant,{src:string;alt:string}> = {
  stealth:{src:"/usagi-stealth.png",alt:"몰래 보는 우사기"},
  focus:{src:"/usagi-focus.png",alt:"돋보기로 집중 분석하는 우사기"},
  data:{src:"/usagi-data.png",alt:"데이터를 정리하는 우사기"},
  pattern:{src:"/usagi-pattern.png",alt:"대화 패턴을 살피는 우사기"},
  relation:{src:"/usagi-relation.png",alt:"관계를 이해하는 우사기"},
};
export default function BrandFeature({variant,size=54}:{variant:Variant;size?:number}){const m=META[variant];return <span className={`brand-feature brand-feature-${variant}`}><Image src={m.src} width={size} height={Math.round(size*.78)} alt={m.alt}/></span>}
