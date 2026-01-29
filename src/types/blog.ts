/**
 * 博客文章类型定义
 */

export interface BlogPost {
  /** 文章 URL 路径 */
  slug: string;
  /** 文章标题 */
  title: string;
  /** 文章内容 (Markdown) */
  content: string;
  /** 文章摘要 */
  excerpt: string;
  /** 发布日期 */
  date: string;
  /** 文章分类 */
  category: string;
  /** 标签列表 */
  tags: string[];
  /** 作者 */
  author?: string;
  /** 阅读时间 (分钟) */
  readingTime?: number;
  /** 是否为草稿 */
  draft?: boolean;
}

export interface BlogCategory {
  /** 分类名称 */
  name: string;
  /** 分类路径 */
  slug: string;
  /** 文章数量 */
  count: number;
  /** 分类描述 */
  description?: string;
}

export interface BlogFrontmatter {
  title?: string;
  date?: string;
  category?: string;
  tags?: string[];
  author?: string;
  draft?: boolean;
  description?: string;
}

export interface PostNavigation {
  /** 上一篇文章 */
  prev?: {
    title: string;
    slug: string;
  };
  /** 下一篇文章 */
  next?: {
    title: string;
    slug: string;
  };
}
