import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { HeaderWrapper } from "@/components/layout/header-wrapper";

export const metadata: Metadata = {
  title: "我的博客",
  description: "分享技术知识和生活感悟",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col bg-gray-50 antialiased dark:bg-gray-950">
        <HeaderWrapper />
        <main className="w-full flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
