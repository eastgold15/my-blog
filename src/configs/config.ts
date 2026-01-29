/**
 * 全局配置
 * 从环境变量读取 GitHub 仓库信息
 */

export const config = {
  github: {
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || "SCUJJ-OSIG",
    repo: process.env.NEXT_PUBLIC_GITHUB_REPO || "knowledge_base",
    branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || "master",
    apiBaseUrl: "https://api.github.com",
    githubToken: process.env.MY_GITHUB_TOKEN || "",
  },
  blog: {
    title: "我的博客",
    description: "分享技术知识和生活感悟",
    author: "博主",
  },
};
