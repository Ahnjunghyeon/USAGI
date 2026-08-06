import type { HTMLAttributes, ReactNode } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: "neutral" | "ai" | "success";
};

export default function Badge({ tone = "neutral", className = "", children, ...props }: BadgeProps) {
  return <span className={["uds-badge", `uds-badge-${tone}`, className].filter(Boolean).join(" ")} {...props}>{children}</span>;
}
