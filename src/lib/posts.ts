/**
 * 博客文章数据获取工具
 * 结合 GitHub API 和 MDX 处理
 */

import { fetchAllMarkdownFilesRecursive, getFileContent } from "./github";
import { parseBlogPost, generateSlug } from "./mdx";
import { processObsidianSyntax } from "./obsidian";
import type { BlogPost, BlogCategory } from "@/types/blog";

/**
 * 获取所有博客文章
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const markdownFiles = await fetchAllMarkdownFilesRecursive();
  const posts: BlogPost[] = [];

  for (const { category, file } of markdownFiles) {
    if (!file.path) { continue; }

    try {
      const content = await getFileContent(file.path);

      // 处理 Obsidian 语法
      const processedContent = processObsidianSyntax(content);

      const postData = parseBlogPost(file.name, category, processedContent);
      const slug = generateSlug(file.name);

      // 跳过草稿
      if (postData.draft) { continue; }

      posts.push({
        ...postData,
        slug,
      });
    } catch (error) {
      console.error(`Failed to load post: ${file.path}`, error);
    }
  }

  // 按日期排序
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * 根据 slug 获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) || null;
}

/**
 * 获取所有分类
 */
export async function getAllCategories(): Promise<BlogCategory[]> {
  const posts = await getAllPosts();
  const categoryMap = new Map<string, BlogCategory>();

  for (const post of posts) {
    const existing = categoryMap.get(post.category);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(post.category, {
        name: post.category,
        slug: post.category.toLowerCase().replace(/\s+/g, "-"),
        count: 1,
      });
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * 根据分类获取文章
 */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}

/**
 * 获取文章导航（上一篇/下一篇）
 */
export async function getPostNavigation(
  currentSlug: string
): Promise<{ prev?: BlogPost; next?: BlogPost }> {
  const posts = await getAllPosts();
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);

  return {
    prev: currentIndex > 0 ? posts[currentIndex - 1] : undefined,
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined,
  };
}
