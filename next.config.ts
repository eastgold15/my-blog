import type { NextConfig } from "next";
import createMDX from '@next/mdx'

// 检测是否在 GitHub Actions 环境中
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
// 检测是否在 Vercel 环境中
const isVercel = process.env.VERCEL === '1';
// 检测是否是开发环境
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  reactCompiler: true,

  // 只在生产环境且非 Vercel 时使用静态导出
  output: (isDev || isVercel) ? undefined : "export",

  images: {
    unoptimized: true,
  },

  // 只在 GitHub Actions 添加 basePath
  basePath: (isGitHubActions && !isVercel) ? '/my-blog' : '',

  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  // Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)

