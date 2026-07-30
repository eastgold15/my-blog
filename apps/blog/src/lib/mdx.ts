/**
 * MDX 处理工具
 * 使用 gray-matter 解析 frontmatter
 * 使用 reading-time 计算阅读时间
 */

import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogFrontmatter, BlogPost } from "@/types/blog";

const mdReg = /\.(md|mdx)$/;

/**
 * 提取 frontmatter（使用 gray-matter）
 */
export function extractFrontmatter(content: string): BlogFrontmatter {
  let data: Record<string, unknown> = {};
  try {
    data = matter(content).data;
  } catch {
    // YAML 解析失败时返回空对象
  }

  return {
    title: data.title as string | undefined,
    date: data.date as string | undefined,
    category: data.category as string | undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    author: data.author as string | undefined,
    draft: data.draft === true,
    description: data.description as string | undefined,
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
 * 生成文章摘要
 */
export function generateExcerpt(content: string, maxLength = 200): string {
  const { content: body } = matter(content);

  const cleanContent = body
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
 * 计算阅读时间
 */
export function calculateReadingTime(content: string): number {
  const { content: body } = matter(content);
  const result = readingTime(body, { wordsPerMinute: 200 });
  return Math.ceil(result.minutes);
}

/**
 * 从文件名和分类生成唯一的 slug
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
 *
 * @param filename - 文件名
 * @param vaultDir - vault 中的目录路径（如 "0-blog" 或 "1-全栈/elysia"）
 * @param content - 文件内容
 * @returns 文章数据（不含 slug）
 */
export function parseBlogPost(
  filename: string,
  vaultDir: string,
  content: string
): Omit<BlogPost, "slug"> {
  const frontmatter = extractFrontmatter(content);
  const cleanContent = removeFrontmatter(content);

  // 优先使用 frontmatter 中的 category
  // 如果 frontmatter 未指定，从 vault 目录推导
  // 都没有则默认 "其他"
  const category = frontmatter.category || vaultDir || "其他";

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
