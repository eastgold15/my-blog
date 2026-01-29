/**
 * 博客文章数据获取工具
 * 结合 GitHub API 和 MDX 处理
 */

import { fetchAllMarkdownFiles, getFileContent } from "./github";
import { parseBlogPost, generateSlug } from "./mdx";
import { processObsidianSyntax } from "./obsidian";
import type { BlogPost, BlogCategory } from "@/types/blog";

/**
 * 获取所有博客文章（带容错处理）
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  console.log("[getAllPosts] 开始获取文章...");
  const markdownFiles = await fetchAllMarkdownFiles();
  console.log("[getAllPosts] 获取到 Markdown 文件数:", markdownFiles.length);

  const posts: BlogPost[] = [];
  const errors: string[] = [];

  for (const { category, file } of markdownFiles) {
    if (!file.path) { continue; }

    try {
      const content = await getFileContent(file.path);

      // 处理 Obsidian 语法
      const processedContent = processObsidianSyntax(content);

      const postData = parseBlogPost(file.name, category, processedContent);
      const slug = generateSlug(file.name, category);

      // 跳过草稿
      if (postData.draft) {
        continue;
      }

      posts.push({
        ...postData,
        slug,
      });
    } catch (error: any) {
      // 即使内容获取失败，也创建一个基本文章条目
      console.warn(`[getAllPosts] ⚠️ 文件内容获取失败，使用基本信息: ${file.path}`);

      // 创建基本文章对象，确保至少能生成路由
      const slug = generateSlug(file.name, category);
      posts.push({
        slug,
        title: file.name.replace(/\.(md|mdx)$/, ""),
        content: "",
        excerpt: "内容加载中...",
        date: new Date().toISOString(),
        category,
        tags: [],
      });

      errors.push(`${file.path}: ${error.message}`);
    }
  }

  // 按日期排序
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  console.log("[getAllPosts] 成功解析文章数:", sortedPosts.length);
  if (errors.length > 0) {
    console.log("[getAllPosts] 部分文件使用备用数据:", errors.length);
  }

  return sortedPosts;
}

/**
 * 根据 slug 获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // URL 可能被编码，需要解码
  const decodedSlug = decodeURIComponent(slug);
  console.log(`[getPostBySlug] 查找 slug: ${slug} -> 解码后: ${decodedSlug}`);

  const posts = await getAllPosts();

  // 同时检查原始 slug 和解码后的 slug
  const post = posts.find((post) => post.slug === slug || post.slug === decodedSlug);

  console.log(`[getPostBySlug] 找到: ${post ? post.title : "未找到"}`);
  return post || null;
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
