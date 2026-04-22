/**
 * 博客文章类型定义
 */

export interface BlogPost {
  /** 作者 */
  author?: string;
  /** 文章分类 */
  category: string;
  /** 文章内容 (Markdown) */
  content: string;
  /** 发布日期 */
  date: string;
  /** 是否为草稿 */
  draft?: boolean;
  /** 文章摘要 */
  excerpt: string;
  /** 阅读时间 (分钟) */
  readingTime?: number;
  /** 文章 URL 路径 */
  slug: string;
  /** 标签列表 */
  tags: string[];
  /** 文章标题 */
  title: string;
}

export interface BlogCategory {
  /** 文章数量 */
  count: number;
  /** 分类描述 */
  description?: string;
  /** 分类名称 */
  name: string;
  /** 分类路径 */
  slug: string;
}

export interface BlogFrontmatter {
  author?: string;
  category?: string;
  date?: string;
  description?: string;
  draft?: boolean;
  tags?: string[];
  title?: string;
}

export interface PostNavigation {
  /** 下一篇文章 */
  next?: {
    title: string;
    slug: string;
  };
  /** 上一篇文章 */
  prev?: {
    title: string;
    slug: string;
  };
}
