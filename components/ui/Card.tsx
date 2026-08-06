import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "article" | "div";
  children: ReactNode;
  tone?: "default" | "soft" | "accent";
};

export default function Card({ as: Tag = "section", tone = "default", className = "", children, ...props }: CardProps) {
  return <Tag className={["uds-card", `uds-card-${tone}`, className].filter(Boolean).join(" ")} {...props}>{children}</Tag>;
}
