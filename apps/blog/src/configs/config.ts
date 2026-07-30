/**
 * 全局配置
 * vault 仓库 + 排除规则 + 顶部外链
 *
 * 注意:目录扁平化后,不再用 dirs.article/blog 白名单区分文章类型。
 * 全部 .md 走同一条路径,published: true 决定是否发布,frontmatter 决定章节。
 */

export interface ExcludeConfig {
  /** 目录名排除 */
  dirs: string[];
  /** 特定文件名排除 */
  files: string[];
  /** 文件/目录前缀排除 */
  prefix: string[];
}

export interface TabConfig {
  /** 链接地址(支持外链) */
  href: string;
  /** 标签名 */
  label: string;
}

export interface ContentConfig {
  /** 排除规则 */
  exclude: ExcludeConfig;
  /** Tab 栏外链(只剩 GitHub) */
  extraTabs: TabConfig[];
}

export interface VaultConfig {
  /** 分支 */
  branch: string;
  /** 本地缓存目录(相对项目根目录) */
  cacheDir: string;
  /** GitHub Token */
  githubToken: string;
  /** 仓库名 */
  name: string;
  /** 仓库所有者 */
  owner: string;
  /** GitHub 仓库全名 */
  repo: string;
}

export interface BlogConfig {
  blog: {
    title: string;
    description: string;
    author: string;
  };
  content: ContentConfig;
  vault: VaultConfig;
}

export const config: BlogConfig = {
  blog: {
    author: "博主",
    description: "无情记下每一笔",
    title: "pori博客",
  },
  content: {
    exclude: {
      dirs: ["templates", "drafts", "assets", ".git", ".obsidian"],
      files: ["CLAUDE.md"],
      prefix: ["_", "."],
    },
    extraTabs: [{ href: "https://github.com/eastgold15", label: "GitHub" }],
  },
  vault: {
    branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || "main",
    cacheDir: ".vault-cache",
    githubToken: process.env.BLOG_GITHUB_TOKEN || "",
    name: process.env.NEXT_PUBLIC_GITHUB_REPO || "knowledge_base",
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || "SCUJJ-OSIG",
    repo: process.env.BLOG_GITHUB_REPO || "SCUJJ-OSIG/knowledge_base",
  },
};
