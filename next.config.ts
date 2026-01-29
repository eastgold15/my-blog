import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === 'production';
// 只有在 GitHub Actions 环境下才设置前缀，Vercel 不需要
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 关键：生成静态 HTML/CSS/JS
  output: "export",
  images: {
    // GitHub Pages 不支持 Next.js 默认的图片优化
    // 禁用 Next.js 默认的图片优化
    unoptimized: true,
  },
  basePath: isGitHubPages ? '/my-blog' : '',
};

export default nextConfig;
