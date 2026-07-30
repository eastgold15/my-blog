/**
 * vault 扫描 + 维度收集
 * 纯 base 驱动:网页可筛维度从 views.published.base 读
 *
 * 数据源:复用 vault-cache 提供的 .vault-cache 目录(由 syncVault() 拉取),
 * 跟 posts.ts 的 getAllPosts() 走同一条路径,保证 dev/build 行为一致。
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  collectDimensionValues,
  type Dimension,
  type ParsedBase,
  parsePublishedBase,
} from "./base-parser";
import { getAllMarkdownFiles, readVaultFile, syncVault } from "./vault-cache";

/** 单篇笔记对外的类型(兼容 BlogPost) */
export type VaultPost = {
  slug: string;
  title: string;
  filePath: string;
  data: Record<string, unknown>;
  category: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime?: number;
  content?: string;
};

let postsCache: VaultPost[] | null = null;
let schemaCache: ParsedBase | null = null;

/** vault 根目录:只走 .vault-cache(云端统一),没有就 sync */
function getVaultRoot(): string {
  return join(process.cwd(), ".vault-cache");
}

/** base 文件路径(约定 vault 根有 views.published.base) */
function getBasePath(): string {
  return join(getVaultRoot(), "views.published.base");
}

/** 读 base 文件 schema */
export async function getSchema(): Promise<ParsedBase> {
  if (!schemaCache) {
    const basePath = getBasePath();
    if (!existsSync(basePath)) {
      // 触发 vault 同步(首次 / build 阶段)
      await syncVault();
    }
    schemaCache = parsePublishedBase(getBasePath());
  }
  return schemaCache;
}

/** 扫 vault,返回所有 published 笔记 */
export function getAllPublishedPosts(): VaultPost[] {
  if (postsCache) {
    return postsCache;
  }
  const root = getVaultRoot();
  const useCache = root === join(process.cwd(), ".vault-cache");
  const posts: VaultPost[] = [];
  for (const f of getAllMarkdownFiles()) {
    try {
      const raw = useCache
        ? readVaultFile(f.path)
        : readFileSync(join(root, f.path), "utf8");
      const { data } = matter(raw);
      if (data.published !== true) continue;
      const filename = f.path.split("/").pop()!.replace(/\.md$/, "");
      const title = (data.title as string) ?? filename;
      const slug = (data.slug as string) ?? filename;
      posts.push({
        category: String(data["场景"] ?? "未分类"),
        data,
        date: String(
          data.date ?? data["date created"] ?? new Date().toISOString()
        ),
        excerpt: String(data.excerpt ?? data.description ?? ""),
        filePath: f.path,
        slug,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        title,
      });
    } catch {
      // 跳过解析失败的文件
    }
  }
  posts.sort((a, b) =>
    String(b.data.date ?? "").localeCompare(String(a.data.date ?? ""))
  );
  postsCache = posts;
  return posts;
}

/** 拿到 schema + 已填充 values 的维度(用于 chip 栏) */
export async function getDimensions(): Promise<Dimension[]> {
  const schema = await getSchema();
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
