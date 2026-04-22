/**
 * 全局配置
 * 从环境变量读取 GitHub 仓库信息
 */

export interface FileFilterConfig {
  /** 忽略的文件模式（glob 模式） */
  ignorePatterns?: string[];
  /** 只包含的文件模式（可选） */
  includePatterns?: string[];
}

export interface BlogConfig {
  blog: {
    title: string;
    description: string;
    author: string;
  };
  files: FileFilterConfig;
  github: {
    owner: string;
    repo: string;
    branch: string;
    apiBaseUrl: string;
    githubToken: string;
  };
}

export const config: BlogConfig = {
  github: {
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || "SCUJJ-OSIG",
    repo: process.env.NEXT_PUBLIC_GITHUB_REPO || "knowledge_base",
    branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || "master",
    apiBaseUrl: "https://api.github.com",
    githubToken: process.env.BLOG_GITHUB_TOKEN || "",
  },
  blog: {
    title: "我的博客",
    description: "分享技术知识和生活感悟",
    author: "博主",
  },
  /**
   * 文件过滤配置（使用 glob 模式）
   * - ignorePatterns: 匹配的文件将被过滤（不展示）
   * - includePatterns: 只有匹配的文件才会被包含（可选，不配置则包含所有）
   *
   * 示例：
   * - "_**" - 所有以 _ 开头的文件和文件夹
   * - "templates/" - 所有 templates 目录下的文件
   * - "*.template.md" - 所有以 .template.md 结尾的文件
   * - "drafts/" - drafts 目录下的所有文件
   */
  files: {
    // 忽略的文件模式（glob 模式）
    ignorePatterns: [
      "_**", // 所有以 _ 开头的文件和文件夹
      "**/._**", // macOS 隐藏文件
      "**/.**", // 所有隐藏文件/文件夹
      "**/templates/**", // templates 目录
      "**/drafts/**", // drafts 目录
      "*.template.md", // 模板文件
      "**.base",
      "CLAUDE.md",
    ],
    // 只包含的文件模式（可选，不配置则包含所有 markdown 文件）
    includePatterns: ["**/*.md", "**/*.mdx"],
  },
};
