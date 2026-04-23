/**
 * 博客类型定义
 */

export interface BlogPost {
  /** 作者 */
  author?: string;
  /** 分类 */
  category: string;
  /** Markdown 原始内容（文章详情页使用） */
  content?: string;
  /** 发布日期 */
  date: string;
  /** 是否为草稿 */
  draft?: boolean;
  /** 文章摘要 */
  excerpt: string;
  /** 预计阅读时间（分钟） */
  readingTime?: number;
  /** 唯一标识 */
  slug: string;
  /** 标签列表 */
  tags: string[];
  /** 文章标题 */
  title: string;
}

export interface PostNavItem {
  slug: string;
  title: string;
}

export interface PostNavigationType {
  next?: PostNavItem | null;
  prev?: PostNavItem | null;
}

export interface BlogCategory {
  name: string;
  slug: string;
  count: number;
}
