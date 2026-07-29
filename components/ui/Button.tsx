"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "sm";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const buttonClassName = (variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, className = "") =>
  ["ui-button", `ui-button-${variant}`, `ui-button-${size}`, fullWidth ? "ui-button-full" : "", className]
    .filter(Boolean)
    .join(" ");

export function AppButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: AppButtonProps) {
  return <button type={type} className={buttonClassName(variant, size, fullWidth, className)} {...props} />;
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export function ButtonLink({ href, children, variant = "secondary", size = "md", fullWidth = false, className = "" }: ButtonLinkProps) {
  return <Link href={href} className={buttonClassName(variant, size, fullWidth, className)}>{children}</Link>;
}
