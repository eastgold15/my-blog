/**
 * Vault 本地缓存系统
 *
 * 改用 Octokit + codeload zip 拉取(替代 git clone):
 * - 单次 HTTP,3-5 秒拉完整个 vault
 * - 走 GitHub S3,不受 REST API rate limit 约束
 * - 跨平台,不依赖 git 协议
 * - 支持私有仓库(Authorization 头带 token)
 */

import AdmZip from "adm-zip";
import { Octokit } from "@octokit/rest";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { config } from "@/configs/config";
import type { NavItem } from "@/types/navigation";

const CACHE_DIR = config.vault.cacheDir;
const tempCachePath = `${CACHE_DIR}.tmp`;
const lockPath = `${CACHE_DIR}.lock`;

// 并发锁:让多 worker 不会重复拉取
let syncingPromise: Promise<void> | null = null;

/** 核心:Octokit + codeload zip 同步到本地 */
async function syncFromGithub(): Promise<void> {
  const { owner, name: repo, githubToken: token, branch } = config.vault;
  if (!token) {
    throw new Error("BLOG_GITHUB_TOKEN 未设置,无法拉取 vault");
  }

  const cachePath = join(process.cwd(), CACHE_DIR);

  // 已有缓存 → 跳过
  if (existsSync(join(cachePath, "views.published.base"))) {
    console.log("[vault-cache] ✅ 缓存已存在,跳过拉取");
    return;
  }

  console.log(`[vault-cache] 开始拉取 ${owner}/${repo}@${branch} (codeload zip)`);

  const octokit = new Octokit({ auth: token });
  // 拿 default branch 的最新 commit SHA(显式 SHA 比传 branch name 更可靠,
  // 避免 codeload 用过时的 cache)
  const { data: repoMeta } = await octokit.rest.repos.get({ owner, repo });
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${repoMeta.default_branch}`,
  });
  const sha = refData.object.sha;

  const archive = await octokit.rest.repos.downloadZipballArchive({
    owner,
    repo,
    ref: sha,
  });
  const url = (archive as { url: string }).url;

  console.log(`[vault-cache] 下载 zip: ${url.slice(0, 80)}...`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`zip 下载失败: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(`[vault-cache] 下载完成 (${(buf.length / 1024).toFixed(1)} KB),解压中...`);

  const zip = new AdmZip(buf);
  const entries = zip.getEntries();
  const rootPrefix = entries[0]?.entryName.split("/")[0] ?? "";
  if (!rootPrefix) {
    throw new Error("zip 结构异常,找不到根目录");
  }

  if (existsSync(tempCachePath)) {
    rmSync(tempCachePath, { force: true, recursive: true });
  }
  mkdirSync(tempCachePath, { recursive: true });

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const rel = entry.entryName.slice(rootPrefix.length + 1);
    if (!rel) continue;
    const out = join(tempCachePath, rel);
    mkdirSync(join(out, ".."), { recursive: true });
    writeFileSync(out, entry.getData());
  }

  if (existsSync(cachePath)) {
    rmSync(cachePath, { force: true, recursive: true });
  }
  renameSync(tempCachePath, cachePath);
  console.log(`[vault-cache] ✅ 同步完成 (${entries.length} 条目)`);
}

/** 异步同步入口:并发安全(多 worker 共享同一个 promise) */
export async function syncVault(): Promise<void> {
  if (syncingPromise) {
    return syncingPromise;
  }
  syncingPromise = (async () => {
    try {
      await syncFromGithub();
    } finally {
      syncingPromise = null;
    }
  })();
  return syncingPromise;
}

// ─── 文件读取 ────────────────────────────────────────

/** 读取缓存中的文件内容 */
export function readVaultFile(relativePath: string): string {
  const fullPath = join(process.cwd(), CACHE_DIR, relativePath);
  return readFileSync(fullPath, "utf-8");
}

// ─── 文件发现 ────────────────────────────────────────

export interface VaultFile {
  /** article 所属章节目录（如 "elysia"） */
  chapterDir?: string;
  /** 文件名（含扩展名） */
  name: string;
  /** 相对 vault 根目录的路径 */
  path: string;
  /** 文件类型 */
  type: "blog" | "article";
}

const NUM_PREFIX_REGEX = /^\d+-/;

function shouldExclude(name: string): boolean {
  const { exclude } = config.content;
  for (const prefix of exclude.prefix) {
    if (name.startsWith(prefix)) return true;
  }
  if (exclude.dirs.includes(name)) return true;
  if (exclude.files.includes(name)) return true;
  return false;
}

export function getAllMarkdownFiles(): VaultFile[] {
  const root = join(process.cwd(), CACHE_DIR);
  const files: VaultFile[] = [];

  function walk(dir: string, relPath: string) {
    for (const name of readdirSync(dir)) {
      if (shouldExclude(name)) continue;
      const full = join(dir, name);
      const rel = relPath ? `${relPath}/${name}` : name;
      if (statSync(full).isDirectory()) {
        walk(full, rel);
        continue;
      }
      if (!(name.endsWith(".md") || name.endsWith(".mdx"))) continue;
      // 派生 chapterDir:直接父目录名(剥数字前缀)
      const parentSegs = rel.split("/").slice(0, -1);
      const lastParent = parentSegs[parentSegs.length - 1];
      const chapterDir = lastParent ? lastParent.replace(NUM_PREFIX_REGEX, "") : undefined;
      files.push({
        chapterDir,
        name,
        path: rel,
        type: "article", // 字段保留,前端不再用
      });
    }
  }

  if (existsSync(root)) {
    walk(root, "");
  }
  return files;
}

// ─── 导航树（Tab 栏）────────────────────────────────

export function buildNavTree(): NavItem[] {
  // 目录扁平化:内部 tab 全部删除,只返回外链
  const items: NavItem[] = [];
  for (const tab of config.content.extraTabs) {
    items.push({
      isExternal: true,
      label: tab.label,
      slug: tab.href,
    });
  }
  return items;
}

// ─── 树形结构 ────────────────────────────────────────

export interface TreeNode {
  children?: TreeNode[];
  name: string;
  path: string;
  type: "file" | "dir";
}

/**
 * 递归构建目录树
 * 用于左侧章节导航的树形展示
 */
export function buildFileTree(dirPath: string): TreeNode[] {
  const root = join(process.cwd(), CACHE_DIR);
  const fullPath = join(root, dirPath);
  if (!existsSync(fullPath)) return [];

  const entries = readdirSync(fullPath).sort();
  const tree: TreeNode[] = [];

  for (const entry of entries) {
    if (shouldExclude(entry)) continue;
    const entryPath = `${dirPath}/${entry}`;
    const fullEntryPath = join(fullPath, entry);

    try {
      if (statSync(fullEntryPath).isDirectory()) {
        tree.push({
          children: buildFileTree(entryPath),
          name: entry.replace(NUM_PREFIX_REGEX, ""),
          path: entryPath,
          type: "dir",
        });
      } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
        tree.push({
          name: entry.replace(/\.(md|mdx)$/, ""),
          path: entryPath,
          type: "file",
        });
      }
    } catch {
      // skip inaccessible entries
    }
  }

  return tree;
}

/**
 * 获取目录下第一个可用的 .md 文件路径
 */
export function getFirstMdFile(dirPath: string): string | null {
  const root = join(process.cwd(), CACHE_DIR);
  const fullPath = join(root, dirPath);
  if (!existsSync(fullPath)) return null;

  const entries = readdirSync(fullPath).sort();
  for (const entry of entries) {
    if (shouldExclude(entry)) continue;
    const fullEntryPath = join(fullPath, entry);
    try {
      if (statSync(fullEntryPath).isDirectory()) {
        const found = getFirstMdFile(`${dirPath}/${entry}`);
        if (found) return found;
      } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
        return `${dirPath}/${entry}`;
      }
    } catch {
      throw new Error("不能获取目录下第一个可用的 .md 文件");
    }
  }

  return null;
}
