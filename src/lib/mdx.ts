/**
 * MDX 处理工具
 * 解析 Markdown 内容，提取 frontmatter，生成摘要
 */

import type { BlogFrontmatter, BlogPost } from "@/types/blog";

/**
 * 从 Markdown 内容中提取 frontmatter
 */
export function extractFrontmatter(content: string): BlogFrontmatter {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  const yamlContent = match[1];
  const frontmatter: BlogFrontmatter = {};

  // 简单的 YAML 解析（支持 key: value 格式）
  const lines = yamlContent.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // 处理不同的值类型
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value === "true") {
      value = "true";
    } else if (value === "false") {
      value = "false";
    }

    // 处理数组格式（tags: [tag1, tag2]）
    if (value.startsWith("[") && value.endsWith("]")) {
      const arrayContent = value.slice(1, -1);
      value = arrayContent
        .split(",")
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
        .join(",");
    }

    switch (key) {
      case "title":
        frontmatter.title = value;
        break;
      case "date":
        frontmatter.date = value;
        break;
      case "category":
        frontmatter.category = value;
        break;
      case "tags":
        frontmatter.tags = value.split(",").map((t) => t.trim());
        break;
      case "author":
        frontmatter.author = value;
        break;
      case "draft":
        frontmatter.draft = value === "true";
        break;
      case "description":
        frontmatter.description = value;
        break;
    }
  }

  return frontmatter;
}

/**
 * 移除 frontmatter，返回纯内容
 */
export function removeFrontmatter(content: string): string {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
}

/**
 * 生成文章摘要（从内容中提取前 N 个字符）
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  const cleanContent = removeFrontmatter(content)
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

  return cleanContent.slice(0, maxLength).trim() + "...";
}

/**
 * 计算阅读时间（分钟）
 */
export function calculateReadingTime(content: string): number {
  const cleanContent = removeFrontmatter(content);
  const wordsPerMinute = 200; // 中文阅读速度
  const wordCount = cleanContent.length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * 从文件名和分类生成唯一的 slug
 * 使用分类前缀确保不同目录下同名文件不会冲突
 */
export function generateSlug(filename: string, category: string): string {
  const baseName = filename
    .replace(/\.(md|mdx)$/, "")
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
    title: frontmatter.title || filename.replace(/\.(md|mdx)$/, ""),
    content: cleanContent,
    excerpt: frontmatter.description || generateExcerpt(content),
    date: frontmatter.date || new Date().toISOString(),
    category,
    tags: frontmatter.tags || [],
    author: frontmatter.author,
    readingTime: calculateReadingTime(content),
    draft: frontmatter.draft || false,
  };
}
