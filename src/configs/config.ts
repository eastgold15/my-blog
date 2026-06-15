/**
 * 全局配置
 * 定义 vault 仓库、内容目录、Tab 栏等
 */

export interface DirConfig {
  /** 博客目录：*.md 直接放在目录下（页面只有右侧目录） */
  blog: string[];
  /** 文章目录：子目录分章节，*.md 在子目录内（左章节导航 + 右目录） */
  article: string[];
}

export interface TabConfig {
  /** 标签名 */
  label: string;
  /** 链接地址（支持外链） */
  href: string;
}

export interface ExcludeConfig {
  /** 文件/目录前缀排除 */
  prefix: string[];
  /** 目录名排除 */
  dirs: string[];
  /** 特定文件名排除 */
  files: string[];
}

export interface ContentConfig {
  /** 内容目录配置 */
  dirs: DirConfig;
  /** Tab 栏附加标签（外链等） */
  extraTabs: TabConfig[];
  /** 排除规则 */
  exclude: ExcludeConfig;
}

export interface VaultConfig {
  /** GitHub 仓库全名 */
  repo: string;
  /** 仓库所有者 */
  owner: string;
  /** 仓库名 */
  name: string;
  /** 分支 */
  branch: string;
  /** 本地缓存目录（相对项目根目录） */
  cacheDir: string;
  /** GitHub Token */
  githubToken: string;
}

export interface BlogConfig {
  vault: VaultConfig;
  content: ContentConfig;
  blog: {
    title: string;
    description: string;
    author: string;
  };
}

export const config: BlogConfig = {
  vault: {
    repo: process.env.BLOG_GITHUB_REPO || "SCUJJ-OSIG/knowledge_base",
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || "SCUJJ-OSIG",
    name: process.env.NEXT_PUBLIC_GITHUB_REPO || "knowledge_base",
    branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || "main",
    cacheDir: ".vault-cache",
    githubToken: process.env.BLOG_GITHUB_TOKEN || "",
  },
  blog: {
    title: "我的博客",
    description: "分享技术知识和生活感悟",
    author: "博主",
  },
  content: {
    dirs: {
      blog: ["0-blog"],
      article: ["4-全栈", "2-技术文章", "1-自用软件"],
    },
    extraTabs: [{ label: "GitHub", href: "https://github.com/eastgold15" }],
    exclude: {
      prefix: ["_", "."],
      dirs: ["templates", "drafts", "assets", ".git", ".obsidian"],
      files: ["CLAUDE.md"],
    },
  },
};
