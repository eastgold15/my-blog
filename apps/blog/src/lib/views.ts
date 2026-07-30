/**
 * vault 扫描 + 维度收集
 * 纯 base 驱动:网页可筛维度从 views.published.base 读
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  collectDimensionValues,
  parsePublishedBase,
  type Dimension,
  type ParsedBase,
} from "./base-parser";

const VAULT_ROOT = process.env.VAULT_PATH || "H:/main/knowledge_base";
const BASE_FILE = `${VAULT_ROOT}/views.published.base`;

function walk(dir: string, out: string[] = []): string[] {
  const skip = new Set([
    ".obsidian",
    ".git",
    ".agents",
    ".claude",
    "node_modules",
    "scripts",
    "copilot",
    "assets",
    "public",
  ]);
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

/** 单篇笔记对外的类型(兼容 BlogPost) */
export type VaultPost = {
  /** 唯一 slug(用 frontmatter 里的 title 或文件名) */
  slug: string;
  /** 显示标题 */
  title: string;
  /** vault 中的相对路径 */
  filePath: string;
  /** 原始 frontmatter */
  data: Record<string, unknown>;
  /** 兼容 PostCard 的字段 */
  category: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime?: number;
  content?: string;
};

let postsCache: VaultPost[] | null = null;
let schemaCache: ParsedBase | null = null;

/** 读 base 文件 schema */
export function getSchema(): ParsedBase {
  if (!schemaCache) {
    schemaCache = parsePublishedBase(BASE_FILE);
  }
  return schemaCache;
}

/** 扫 vault,返回所有 published 笔记 */
export function getAllPublishedPosts(): VaultPost[] {
  if (postsCache) {
    return postsCache;
  }
  const files = walk(VAULT_ROOT);
  const posts: VaultPost[] = [];
  for (const f of files) {
    try {
      const { data } = matter(readFileSync(f, "utf8"));
      if (data.published !== true) continue;
      const filename = f.split(/[\\/]/).pop()!.replace(/\.md$/, "");
      const title = (data.title as string) ?? filename;
      const slug = (data.slug as string) ?? filename;
      posts.push({
        slug,
        title,
        filePath: f,
        data,
      });
    } catch {
      // 跳过解析失败的文件
    }
  }

  // 二次遍历:填上兼容 PostCard 的字段
  for (const post of posts) {
    const { data } = post;
    post.category = String(data["场景"] ?? "未分类");
    post.date = String(data.date ?? data["date created"] ?? new Date().toISOString());
    post.tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];
    post.excerpt = String(data.excerpt ?? data.description ?? "");
  }
  posts.sort((a, b) => String(b.data.date ?? "").localeCompare(String(a.data.date ?? "")));
  postsCache = posts;
  return posts;
}

/** 拿到 schema + 已填充 values 的维度(用于 chip 栏) */
export function getDimensions(): Dimension[] {
  const schema = getSchema();
  const posts = getAllPublishedPosts();
  return collectDimensionValues(
    schema.dimensions,
    posts.map((p) => p.data)
  );
}

/** 根据 slug 找单篇 */
export function getPostBySlug(slug: string): VaultPost | null {
  return getAllPublishedPosts().find((p) => p.slug === slug) ?? null;
}
