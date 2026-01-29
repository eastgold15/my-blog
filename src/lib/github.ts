/**
 * GitHub API 工具函数
 * 用于获取远程仓库的文件内容
 */

import { config } from "@/configs/config";
import { ghFetch } from "./api";

export interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  url?: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  size?: number;
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
      // 跳过隐藏目录中的文件
      if (item.path.split("/").some((part) => part.startsWith("."))) {
        continue;
      }

      // 将父级目录名作为 category
      const pathParts = item.path.split("/");
      const category =
        pathParts.length > 1 ? pathParts[pathParts.length - 2] : "Uncategorized";

      results.push({
        category,
        file: {
          name: pathParts[pathParts.length - 1],
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
