import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://baotitle.vercel.app";

export const metadata: Metadata = {
  title: "爆标题 - 小红书爆款标题生成器",
  description:
    "AI 一键生成小红书爆款标题和正文大纲，种草、干货、悬念多种风格，复制即用。博主日更必备效率工具。",
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
    description: "AI 生成标题 + 正文大纲，5 种风格，复制即用",
    url: siteUrl,
    siteName: "爆标题",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "爆标题 - 小红书爆款标题生成器",
    description: "AI 生成标题 + 正文大纲，博主日更必备",
  },
  robots: { index: true, follow: true },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
