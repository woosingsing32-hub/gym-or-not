import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "단단 — 오늘 운동 갈지 말지, 캐릭터한테 물어봐",
  description: "운동을 기록하는 앱이 아니라, 오늘 운동 갈지 말지 결정하는 순간을 도와주는 서비스",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
<script defer src="https://cloud.umami.is/script.js" data-website-id="4f45b965-d188-4f78-ac86-51912997db2f"></script>