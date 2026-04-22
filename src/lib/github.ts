/**
 * GitHub API 工具函数
 * 用于获取远程仓库的文件内容
 */

import micromatch from "micromatch";
import { config } from "@/configs/config";
import type { NavItem } from "@/types/navigation";
import { ghFetch } from "./api";

export interface GitHubFile {
  name: string;
  path: string;
  size?: number;
  type: "file" | "dir";
  url?: string;
}

export interface GitHubTreeItem {
  mode: string;
  path: string;
  size?: number;
  type: string;
  url?: string;
}

export interface GitHubTreeResponse {
  sha: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface GitHubContent {
  content: string;
  encoding: string;
}

// 博客目录名称（可配置）
const BLOG_DIR = "0-blog";

// 用于移除数字前缀的正则
const NUM_PREFIX_REGEX = /^\d+-/;

// 用于匹配 md/mdx 扩展名的正则
const MD_EXTENSION_REGEX = /\.(md|mdx)$/;

/**
 * 检查文件是否应该被过滤
 * 使用 glob 模式匹配配置文件中的规则
 */
export function shouldFilterFile(path: string): boolean {
  const ignorePatterns = config.files?.ignorePatterns || [];

  // 使用 micromatch 进行 glob 匹配
  if (ignorePatterns.length > 0) {
    return micromatch.isMatch(path, ignorePatterns);
  }

  return false;
}

// 获取文件列表
export function getRepoFiles(path: string) {
  const endpoint = `/repos/${config.github.owner}/${config.github.repo}/contents/${path.trim()}?ref=${config.github.branch}`;
  return ghFetch<GitHubFile[]>(endpoint);
}

// 获取单个文件内容（利用 headers 覆盖实现 raw 读取）
export function getFileContent(path: string) {
  const endpoint = `/repos/${config.github.owner}/${config.github.repo}/contents/${path.trim()}?ref=${config.github.branch}`;
  return ghFetch<string>(endpoint, {
    headers: { Accept: "application/vnd.github.v3.raw" },
  });
}

/**
 * 使用 Git Tree API 一次性获取整个仓库的文件树（只请求一次！）
 * 这是更高效的实现方式，避免递归调用导致的多次 API 请求
 */
export async function getRepoTree(): Promise<GitHubTreeItem[]> {
  const endpoint = `/repos/${config.github.owner}/${config.github.repo}/git/trees/${config.github.branch}?recursive=1`;
  const response = await ghFetch<GitHubTreeResponse>(endpoint);

  // 如果树被截断（文件太多），需要分页处理
  if (response.truncated) {
    console.warn("[GitHub] 文件树被截断，部分文件可能未获取到");
  }

  return response.tree;
}

/**
 * 获取所有 Markdown 文件（使用 Tree API，只需一次请求！）
 */
export async function fetchAllMarkdownFiles(): Promise<
  Array<{ category: string; file: GitHubFile }>
> {
  const tree = await getRepoTree();
  const results: Array<{ category: string; file: GitHubFile }> = [];

  for (const item of tree) {
    // 只处理 markdown 文件
    if (
      item.type === "blob" &&
      (item.path.endsWith(".md") || item.path.endsWith(".mdx"))
    ) {
      // 跳过需要过滤的文件
      if (shouldFilterFile(item.path)) {
        continue;
      }

      // 将完整目录路径作为 category（不包含文件名）
      const pathParts = item.path.split("/");
      const category =
        pathParts.length > 1
          ? pathParts.slice(0, -1).join("/") // 完整目录路径
          : "Uncategorized";

      results.push({
        category,
        file: {
          name: pathParts.at(-1) || item.path,
          path: item.path,
          type: "file",
          size: item.size,
          url: item.url,
        },
      });
    }
  }

  return results;
}

/**
 * 构建导航树结构
 * 根据 GitHub 仓库目录结构生成导航栏
 */
export async function buildNavigationTree(): Promise<NavItem[]> {
  const tree = await getRepoTree();
  const navItems: NavItem[] = [];

  // 获取第一层目录
  const firstLevelDirs = new Set<string>();

  for (const item of tree) {
    if (item.type === "tree") {
      const parts = item.path.split("/");
      // 只取第一层目录，跳过隐藏目录
      if (parts.length === 1 && !parts[0].startsWith(".")) {
        firstLevelDirs.add(parts[0]);
      }
    }
  }

  // 为每个第一层目录创建导航项
  for (const dir of Array.from(firstLevelDirs).sort()) {
    const navItem: NavItem = {
      label: dir.replace(NUM_PREFIX_REGEX, ""), // 显示时移除数字前缀
      slug: dir === BLOG_DIR ? "/posts" : `/${dir}`, // 使用原始路径作为 URL
      isBlog: dir === BLOG_DIR,
      path: dir,
      children: [],
    };

    // 获取子目录
    const children = await getChildren(dir, tree);
    if (children.length > 0) {
      navItem.children = children;
    }

    navItems.push(navItem);
  }

  return navItems;
}

/**
 * 获取目录的子项
 */
function getChildren(parentPath: string, tree: GitHubTreeItem[]): NavItem[] {
  const children: NavItem[] = [];

  for (const item of tree) {
    if (item.type === "tree") {
      const parts = item.path.split("/");
      // 检查是否是直接子目录
      if (parts.length === 2 && parts[0] === parentPath) {
        const childName = parts[1];
        // 跳过隐藏目录
        if (childName.startsWith(".")) {
          continue;
        }

        children.push({
          label: childName.replace(NUM_PREFIX_REGEX, ""), // 显示时移除数字前缀
          slug: `/${item.path}`, // 使用原始路径作为 URL
          path: item.path,
        });
      }
    }
  }

  return children.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * 获取指定目录下的所有文件
 */
export async function getAllFilesInDir(dirPath: string): Promise<GitHubFile[]> {
  const tree = await getRepoTree();
  const files: GitHubFile[] = [];

  for (const item of tree) {
    if (
      item.type === "blob" &&
      item.path.startsWith(`${dirPath}/`) &&
      (item.path.endsWith(".md") || item.path.endsWith(".mdx"))
    ) {
      // 跳过需要过滤的文件
      if (shouldFilterFile(item.path)) {
        continue;
      }

      const parts = item.path.split("/");
      files.push({
        name: parts.at(-1) || item.path,
        path: item.path,
        type: "file",
        size: item.size,
        url: item.url,
      });
    }
  }

  return files;
}

/**
 * 获取所有文件路径映射（用于双链解析）
 * 返回：{ "文件名": "完整路径", ... }
 */
export async function getFilepathMap(): Promise<Map<string, string>> {
  const tree = await getRepoTree();
  const pathMap = new Map<string, string>();

  for (const item of tree) {
    if (
      item.type === "blob" &&
      (item.path.endsWith(".md") || item.path.endsWith(".mdx"))
    ) {
      // 跳过需要过滤的文件
      if (shouldFilterFile(item.path)) {
        continue;
      }

      const parts = item.path.split("/");
      const fileName = parts.at(-1)?.replace(MD_EXTENSION_REGEX, "") || "";

      // 存储多个可能的 key 用于模糊匹配
      pathMap.set(fileName, item.path); // 文件名
      pathMap.set(item.path, item.path); // 完整路径
    }
  }

  return pathMap;
}
