/**
 * Vault 本地缓存系统
 *
 * 功能：
 * 1. 首次运行 git clone --depth 1 同步 vault 到本地
 * 2. 后续构建只用 git pull（失败则使用旧缓存）
 * 3. 本地文件发现 + 按 config 规则筛选
 * 4. 构建期间 0 次 GitHub API 调用
 */

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { config } from "@/configs/config";
import type { NavItem } from "@/types/navigation";

const CACHE_DIR = config.vault.cacheDir;

// ─── Git 同步 ────────────────────────────────────────

function getCloneUrl(): string {
  const { owner, name, githubToken: token } = config.vault;
  if (!token) return `https://github.com/${owner}/${name}.git`;
  return `https://oauth2:${token}@github.com/${owner}/${name}.git`;
}

/** 检查 git 仓库是否就绪（HEAD 可访问） */
function isRepoReady(cachePath: string): boolean {
  try {
    execSync(`git -C "${cachePath}" rev-parse HEAD --quiet`, {
      stdio: "pipe",
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

export function syncVault(): void {
  const cachePath = join(process.cwd(), CACHE_DIR);
  const repoUrl = getCloneUrl();
  const branch = config.vault.branch;
  const dotGit = join(cachePath, ".git");
  const lockPath = `${cachePath}.lock`;
  const tempCachePath = `${cachePath}.tmp`;

  function acquireLock(): boolean {
    try {
      mkdirSync(lockPath);
      return true;
    } catch {
      return false;
    }
  }

  function releaseLock(): void {
    try {
      rmSync(lockPath, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  function waitForClone(): void {
    for (let i = 0; i < 30; i++) {
      if (isRepoReady(cachePath)) {
        console.log("[vault-cache] ✅ 其他 worker 已同步完成");
        return;
      }
      execSync("sleep 1", { stdio: "ignore" });
    }
    throw new Error("等待 git clone 超时");
  }

  // .git 存在且 HEAD 可读 → 已克隆完成
  if (existsSync(dotGit) && isRepoReady(cachePath)) {
    try {
      console.log("[vault-cache] 检查更新: git fetch + reset");
      execSync(
        `git -C "${cachePath}" fetch origin ${branch} --depth 1 --force`,
        { stdio: "inherit", timeout: 30_000 }
      );
      execSync(`git -C "${cachePath}" reset --hard FETCH_HEAD`, {
        stdio: "inherit",
        timeout: 15_000,
      });
      console.log("[vault-cache] ✅ 已是最新");
    } catch {
      console.warn("[vault-cache] ⚠️ 拉取失败，使用本地缓存");
    }
    return;
  }

  // .git 存在但 HEAD 不可读 → 其他 worker 正在 clone，等待
  if (existsSync(dotGit)) {
    waitForClone();
    return;
  }

  // 处理并发首次 clone
  if (!acquireLock()) {
    waitForClone();
    return;
  }

  try {
    console.log(`[vault-cache] 首次同步: git clone ${config.vault.repo}`);

    if (existsSync(tempCachePath)) {
      rmSync(tempCachePath, { recursive: true, force: true });
    }

    if (existsSync(cachePath)) {
      rmSync(cachePath, { recursive: true, force: true });
    }

    execSync(
      `git clone --depth 1 --branch ${branch} "${repoUrl}" "${tempCachePath}"`,
      { stdio: "inherit", timeout: 90_000 }
    );

    if (existsSync(cachePath)) {
      rmSync(cachePath, { recursive: true, force: true });
    }
    renameSync(tempCachePath, cachePath);
    console.log("[vault-cache] ✅ 同步完成");
  } finally {
    releaseLock();
    if (existsSync(tempCachePath)) {
      rmSync(tempCachePath, { recursive: true, force: true });
    }
  }
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

  for (const blogDir of config.content.dirs.blog) {
    const fullPath = join(root, blogDir);
    if (!existsSync(fullPath)) continue;
    const items = readdirSync(fullPath);
    for (const item of items) {
      if (shouldExclude(item)) continue;
      if (!(item.endsWith(".md") || item.endsWith(".mdx"))) continue;
      files.push({ path: join(blogDir, item), name: item, type: "blog" });
    }
  }

  for (const articleDir of config.content.dirs.article) {
    const fullParent = join(root, articleDir);
    if (!existsSync(fullParent)) continue;
    const topItems = readdirSync(fullParent);
    for (const topItem of topItems) {
      if (shouldExclude(topItem)) continue;
      const fullSubPath = join(fullParent, topItem);
      if (!statSync(fullSubPath).isDirectory()) continue;
      const chapterName = topItem.replace(NUM_PREFIX_REGEX, "");
      const subItems = readdirSync(fullSubPath);
      for (const subItem of subItems) {
        if (shouldExclude(subItem)) continue;
        if (!(subItem.endsWith(".md") || subItem.endsWith(".mdx"))) continue;
        files.push({
          path: `${articleDir}/${topItem}/${subItem}`,
          name: subItem,
          type: "article",
          chapterDir: chapterName,
        });
      }
    }
  }

  return files;
}

// ─── 导航树（Tab 栏）────────────────────────────────

export function buildNavTree(): NavItem[] {
  const items: NavItem[] = [];

  // blog tab
  for (const dir of config.content.dirs.blog) {
    items.push({
      label: dir.replace(NUM_PREFIX_REGEX, ""),
      slug: "/",
      path: dir,
      isBlog: true,
    });
  }

  // article tab（无二级菜单，点击直接进书）
  for (const dir of config.content.dirs.article) {
    items.push({
      label: dir.replace(NUM_PREFIX_REGEX, ""),
      slug: `/${encodeURIComponent(dir)}`,
      path: dir,
    });
  }

  // extra tabs
  for (const tab of config.content.extraTabs) {
    items.push({
      label: tab.label,
      slug: tab.href,
      isExternal: true,
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
          name: entry.replace(NUM_PREFIX_REGEX, ""),
          path: entryPath,
          type: "dir",
          children: buildFileTree(entryPath),
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
