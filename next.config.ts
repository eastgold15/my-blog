import type { NextConfig } from "next";
import createMDX from '@next/mdx'
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
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  // Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)

