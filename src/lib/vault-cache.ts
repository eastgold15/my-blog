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
  readdirSync,
  readFileSync,
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
  if (!token) {
    return `https://github.com/${owner}/${name}.git`;
  }
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

/**
 * 同步 vault 到本地缓存
 * - 首次：git clone --depth 1
 * - 后续：git fetch + reset
 * - 多 worker 并发安全
 */
export function syncVault(): void {
  const cachePath = join(process.cwd(), CACHE_DIR);
  const repoUrl = getCloneUrl();
  const branch = config.vault.branch;
  const dotGit = join(cachePath, ".git");

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
    for (let i = 0; i < 30; i++) {
      if (isRepoReady(cachePath)) {
        console.log("[vault-cache] ✅ 其他 worker 已同步完成");
        return;
      }
      execSync("sleep 1", { stdio: "ignore" });
    }
    throw new Error("等待 git clone 超时");
  }

  // 首次 clone
  console.log(`[vault-cache] 首次同步: git clone ${config.vault.repo}`);
  if (existsSync(cachePath)) {
    rmSync(cachePath, { recursive: true });
  }

  execSync(
    `git clone --depth 1 --branch ${branch} "${repoUrl}" "${cachePath}"`,
    { stdio: "inherit", timeout: 90_000 }
  );
  console.log("[vault-cache] ✅ 同步完成");
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

/** 目录遍历结果 */
interface WalkEntry {
  isDir: boolean;
  path: string;
}

/** 递归遍历目录 */
export function walkDir(dirPath: string, root: string): WalkEntry[] {
  const entries: WalkEntry[] = [];
  const fullPath = join(root, dirPath);

  if (!existsSync(fullPath)) {
    return entries;
  }

  const items = readdirSync(fullPath);
  for (const item of items) {
    const itemPath = join(dirPath, item);
    const fullItemPath = join(root, itemPath);
    const stat = statSync(fullItemPath);

    if (stat.isDirectory()) {
      entries.push({ path: itemPath, isDir: true });
      entries.push(...walkDir(itemPath, root));
    } else {
      entries.push({ path: itemPath, isDir: false });
    }
  }

  return entries;
}

// 用于移除数字前缀的正则
const NUM_PREFIX_REGEX = /^\d+-/;

/**
 * 判断文件或目录是否应该被排除
 */
function shouldExclude(name: string): boolean {
  const { exclude } = config.content;

  // 前缀排除
  for (const prefix of exclude.prefix) {
    if (name.startsWith(prefix)) {
      return true;
    }
  }

  // 目录名排除
  if (exclude.dirs.includes(name)) {
    return true;
  }

  // 文件名排除
  if (exclude.files.includes(name)) {
    return true;
  }

  return false;
}

/**
 * 获取所有 Blog/Article markdown 文件
 * 从本地缓存读取，不调用任何 API
 */
export function getAllMarkdownFiles(): VaultFile[] {
  const root = join(process.cwd(), CACHE_DIR);
  const files: VaultFile[] = [];

  // 处理 dirs.blog → 直接子文件 *.md
  for (const blogDir of config.content.dirs.blog) {
    const fullPath = join(root, blogDir);
    if (!existsSync(fullPath)) {
      continue;
    }

    const items = readdirSync(fullPath);
    for (const item of items) {
      if (shouldExclude(item)) {
        continue;
      }
      if (!(item.endsWith(".md") || item.endsWith(".mdx"))) {
        continue;
      }

      files.push({
        path: join(blogDir, item),
        name: item,
        type: "blog",
      });
    }
  }

  // 处理 dirs.article → 子目录下的 *.md（章节结构）
  for (const articleDir of config.content.dirs.article) {
    const fullParent = join(root, articleDir);
    if (!existsSync(fullParent)) {
      continue;
    }

    const topItems = readdirSync(fullParent);
    for (const topItem of topItems) {
      // 跳过隐藏/排除项
      if (shouldExclude(topItem)) {
        continue;
      }

      const fullSubPath = join(fullParent, topItem);
      if (!statSync(fullSubPath).isDirectory()) {
        continue;
      }

      const chapterName = topItem.replace(NUM_PREFIX_REGEX, "");

      // 读取该子目录下的 *.md 文件
      const subItems = readdirSync(fullSubPath);
      for (const subItem of subItems) {
        if (shouldExclude(subItem)) {
          continue;
        }
        if (!(subItem.endsWith(".md") || subItem.endsWith(".mdx"))) {
          continue;
        }

        files.push({
          path: join(articleDir, topItem, subItem),
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

/**
 * 从 config 生成导航 tab 栏
 *
 * 规则：
 * - dirs.blog → 标签名去数字前缀（如 "0-blog" → "blog"），链接到 /
 * - dirs.article → 标签名去数字前缀，子目录作为下拉菜单
 * - extraTabs → 外链标签（新窗口打开）
 */
export function buildNavTree(): NavItem[] {
  const root = join(process.cwd(), CACHE_DIR);
  const items: NavItem[] = [];

  // 1. 博客 tab
  for (const dir of config.content.dirs.blog) {
    items.push({
      label: dir.replace(NUM_PREFIX_REGEX, ""),
      slug: "/",
      path: dir,
      isBlog: true,
    });
  }

  // 2. 文章 tab（含子目录下拉）
  if (existsSync(root)) {
    for (const dir of config.content.dirs.article) {
      const fullPath = join(root, dir);
      const navItem: NavItem = {
        label: dir.replace(NUM_PREFIX_REGEX, ""),
        slug: `/${encodeURIComponent(dir)}`,
        path: dir,
        children: [],
      };

      if (existsSync(fullPath)) {
        const subDirs = readdirSync(fullPath).filter(
          (name) =>
            !shouldExclude(name) && statSync(join(fullPath, name)).isDirectory()
        );

        navItem.children = subDirs.sort().map((sub) => ({
          label: sub.replace(NUM_PREFIX_REGEX, ""),
          slug: `/${encodeURIComponent(join(dir, sub))}`,
          path: join(dir, sub),
        }));
      }

      items.push(navItem);
    }
  }

  // 3. 外部链接 tab
  for (const tab of config.content.extraTabs) {
    items.push({
      label: tab.label,
      slug: tab.href,
      isExternal: true,
    });
  }

  return items;
}

// ─── 章节文章获取 ────────────────────────────────────

/**
 * 获取同一章节（同目录）下的所有文章
 */
export function getChapterFiles(chapterPath: string): VaultFile[] {
  const root = join(process.cwd(), CACHE_DIR);
  const fullPath = join(root, chapterPath);
  const files: VaultFile[] = [];

  if (!existsSync(fullPath)) {
    return files;
  }

  const items = readdirSync(fullPath);
  for (const item of items) {
    if (shouldExclude(item)) {
      continue;
    }
    if (!(item.endsWith(".md") || item.endsWith(".mdx"))) {
      continue;
    }

    files.push({
      path: join(chapterPath, item),
      name: item,
      type: "article",
    });
  }

  return files;
}
