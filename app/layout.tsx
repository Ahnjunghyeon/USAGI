import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우사기 | 우리 사이 기류",
  description: "우사기 - 대화를 보여주세요. 함께 살펴볼게요 👀",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
