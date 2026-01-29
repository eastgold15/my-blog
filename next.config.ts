import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 关键：生成静态 HTML/CSS/JS
  output: "export",
  images: {
    // GitHub Pages 不支持 Next.js 默认的图片优化
    // 禁用 Next.js 默认的图片优化
    unoptimized: true,
  }
};

export default nextConfig;
