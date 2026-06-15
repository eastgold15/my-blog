/**
 * 博客文章数据获取工具
 * 从本地 vault 缓存读取，0 次 GitHub API 调用
 */

import type { BlogCategory, BlogPost, PostNavigationType } from "@/types/blog";
import { processObsidianSyntax } from "./obsidian";
import { generateSlug, parseBlogPost } from "./mdx";

// vault-cache 懒导入（只在首次调用时触发 git sync）
let vaultCache: typeof import("./vault-cache");

async function getVaultCache() {
  if (!vaultCache) {
    vaultCache = await import("./vault-cache");
    vaultCache.syncVault();
  }
  return vaultCache;
}

// 运行时缓存（避免重复读取）
let postsCache: BlogPost[] | null = null;

/**
 * 获取所有博客文章（带运行时缓存）
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  if (postsCache) {
    return postsCache;
  }

  const cache = await getVaultCache();
  const markdownFiles = cache.getAllMarkdownFiles();

  const posts: BlogPost[] = [];
  const errors: string[] = [];

  for (const file of markdownFiles) {
    // vaultDir 在 try 和 catch 中都需要
    let vaultDir: string;

    try {
      const content = cache.readVaultFile(file.path);

      // 处理 Obsidian 语法（标签和块引用）
      const processedContent = processObsidianSyntax(content);

      // vault 中的目录路径用作 fallback category
      vaultDir = getVaultDir(file);

      const postData = parseBlogPost(
        file.name,
        vaultDir,
        processedContent,
      );
      const slug = generateSlug(file.name, postData.category);

      // 跳过草稿
      if (postData.draft) {
        continue;
      }

      posts.push({
        ...postData,
        slug,
        vaultDir,
      });
    } catch (error) {
      vaultDir = file.path.split("/").slice(0, -1).join("/") || "Uncategorized";
      console.warn(
        `[getAllPosts] ⚠️ 文件处理失败：${file.path}`,
        error instanceof Error ? error.message : "",
      );

      // 创建基本文章对象，确保路由可访问
      const slug = generateSlug(file.name, vaultDir);
      posts.push({
        slug,
        title: file.name.replace(/\.(md|mdx)$/, ""),
        content: "",
        excerpt: "内容加载中...",
        date: new Date().toISOString(),
        category: "Uncategorized",
        tags: [],
        vaultDir,
      });

      errors.push(
        `${file.path}: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  // 按日期排序
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  console.log(
    `[getAllPosts] ✅ ${sortedPosts.length} 篇文章就绪`,
    errors.length > 0 ? `（${errors.length} 个文件有警告）` : "",
  );

  postsCache = sortedPosts;
  return sortedPosts;
}

/**
 * 获取 vault 目录路径（用于 fallback category）
 */
function getVaultDir(
  file: import("./vault-cache").VaultFile,
): string {
  const parts = file.path.split("/");
  // 去掉文件名，取目录路径
  return parts.slice(0, -1).join("/");
}

/**
 * 根据 slug 获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const decodedSlug = decodeURIComponent(slug);
  const posts = await getAllPosts();

  return (
    posts.find((p) => p.slug === slug || p.slug === decodedSlug) || null
  );
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
export async function getPostsByCategory(
  category: string,
): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}

/**
 * 获取文章导航（上一篇/下一篇）
 */
export async function getPostNavigation(
  currentSlug: string,
): Promise<PostNavigationType> {
  const posts = await getAllPosts();
  const currentIndex = posts.findIndex((p) => p.slug === currentSlug);

  return {
    prev: currentIndex > 0 ? posts[currentIndex - 1] : undefined,
    next:
      currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined,
  };
}
