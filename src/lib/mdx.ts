/**
 * MDX 处理工具
 * 解析 Markdown 内容，提取 frontmatter，生成摘要
 *
 * 使用 gray-matter 替代手写 frontmatter 解析
 * 使用 reading-time 替代手算阅读时间
 */

import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogFrontmatter, BlogPost } from "@/types/blog";

const mdReg = /\.(md|mdx)$/;

/**
 * 提取 frontmatter（使用 gray-matter）
 */
export function extractFrontmatter(content: string): BlogFrontmatter {
  const { data } = matter(content);

  return {
    title: data.title,
    date: data.date,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author,
    draft: data.draft === true,
    description: data.description,
  };
}

/**
 * 移除 frontmatter，返回纯内容
 */
export function removeFrontmatter(content: string): string {
  const { content: body } = matter(content);
  return body;
}

/**
 * 生成文章摘要（从内容中提取前 N 个字符）
 */
export function generateExcerpt(content: string, maxLength = 200): string {
  const { content: body } = matter(content);

  const cleanContent = body
    // 移除 Markdown 语法
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  return `${cleanContent.slice(0, maxLength).trim()}...`;
}

/**
 * 计算阅读时间（使用 reading-time）
 */
export function calculateReadingTime(content: string): number {
  const { content: body } = matter(content);
  const result = readingTime(body, { wordsPerMinute: 200 });
  return Math.ceil(result.minutes);
}

/**
 * 从文件名和分类生成唯一的 slug
 * 使用分类前缀确保不同目录下同名文件不会冲突
 */
export function generateSlug(filename: string, category: string): string {
  const baseName = filename
    .replace(mdReg, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-一-龥]/g, "");

  const categorySlug = category
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-一-龥]/g, "");

  return `${categorySlug}-${baseName}`;
}

/**
 * 解析博客文章
 */
export function parseBlogPost(
  filename: string,
  category: string,
  content: string
): Omit<BlogPost, "slug"> {
  const frontmatter = extractFrontmatter(content);
  const cleanContent = removeFrontmatter(content);

  return {
    title: frontmatter.title || filename.replace(mdReg, ""),
    content: cleanContent,
    excerpt: frontmatter.description || generateExcerpt(content),
    date: frontmatter.date || new Date().toISOString(),
    category,
    tags: frontmatter.tags || [],
    author: frontmatter.author,
    readingTime: calculateReadingTime(content),
    draft: frontmatter.draft,
  };
}
