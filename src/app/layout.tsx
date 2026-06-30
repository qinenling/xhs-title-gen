import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Analytics from "@/components/Analytics";
import InstallPrompt from "@/components/InstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://baotitle.asia";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "爆标题 - 小红书爆款标题生成器",
  description:
    "AI 一键生成小红书爆款标题和正文大纲，爆款指数评分、对标仿写、完整笔记包。Pro 永久买断，博主日更必备。",
  keywords: [
    "小红书标题",
    "爆款标题",
    "AI写作",
    "小红书运营",
    "正文大纲",
    "博主工具",
  ],
  openGraph: {
    title: "爆标题 - 小红书爆款标题生成器",
    description: "AI 生成标题 + 正文大纲 + 爆款指数，Pro 永久买断",
    url: siteUrl,
    siteName: "爆标题",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "爆标题" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "爆标题 - 小红书爆款标题生成器",
    description: "AI 生成标题 + 正文大纲，博主日更必备",
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    title: "爆标题",
    statusBarStyle: "default",
  },
  applicationName: "爆标题",
  other: {
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e11d48",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
