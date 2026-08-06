import type { HTMLAttributes, ReactNode } from "react";

type NaturalTextProps = HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "div" | "strong" | "small" | "h1" | "h2";
  children: ReactNode;
  balance?: boolean;
};

export default function NaturalText({ as: Tag = "span", balance = false, className = "", children, ...props }: NaturalTextProps) {
  return <Tag className={["natural-text", balance ? "natural-text-balance" : "", className].filter(Boolean).join(" ")} {...props}>{children}</Tag>;
}
