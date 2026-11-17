import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { AppToaster } from "@/components/AppToaster";
import "./globals.css";

const notoSerif = Noto_Serif_KR({
  weight: ["400"],
  preload: false,
  variable: "--font-noto-serif-kr",
});

const notoSans = Noto_Sans_KR({
  weight: ["400", "500"],
  preload: false,
  variable: "--font-noto-sans-kr",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "doc-prompt",
  description: "질문에 답하면 AI에 올릴 초안생성프롬프트.md를 만들어 주는 사이트",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSerif.variable} ${notoSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
