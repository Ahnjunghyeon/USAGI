import Image from "next/image";

type Variant = "stealth" | "focus" | "data" | "pattern" | "relation";
const SOURCES: Record<Variant, string> = {
  stealth: "/ui/usagi-stealth.webp",
  focus: "/ui/usagi-focus.webp",
  data: "/ui/usagi-data.webp",
  pattern: "/ui/usagi-pattern.webp",
  relation: "/ui/usagi-relation.webp",
};

export default function BrandFeature({ variant, size = 54 }: { variant: Variant; size?: number }) {
  return (
    <span className={`brand-feature brand-feature-${variant}`} aria-hidden="true">
      <Image src={SOURCES[variant]} width={size} height={Math.round(size * 0.78)} alt="" />
    </span>
  );
}
