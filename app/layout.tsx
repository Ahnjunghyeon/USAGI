import type { Metadata } from "next";
import "@/styles/tokens.css";
import "@/styles/layout.css";
import "@/styles/components.css";
import "@/styles/interactions.css";
import "@/styles/accessibility.css";
import "./globals.css";
import "@/styles/report.css";
import LocaleProvider from "@/components/LocaleProvider";

export const metadata: Metadata = {
  title: "우사기 | AI 대화 패턴 분석",
  description: "생성형 AI로 대화 흐름과 상호작용 패턴을 정리하는 참고용 분석 서비스",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
