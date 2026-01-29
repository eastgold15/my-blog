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
 * 获取仓库的目录结构（递归获取子目录）
 */
export async function getRepoStructure(
  path: string,
): Promise<Record<string, GitHubFile[]>> {
  const files = await getRepoFiles(path);
  const structure: Record<string, GitHubFile[]> = {};

  for (const file of files) {
    if (file.type === "dir") {
      // 跳过隐藏目录
      if (file.name.startsWith(".")) {
        continue;
      }
      // 递归获取子目录内容
      structure[file.name] = await getRepoFiles(file.path);
    }
  }

  return structure;
}

/**
 * 递归获取所有 Markdown 文件（支持无限层级）
 */
export async function fetchAllMarkdownFilesRecursive(
  path = ""
): Promise<Array<{ category: string; file: GitHubFile }>> {
  const items = await getRepoFiles(path);
  let results: Array<{ category: string; file: GitHubFile }> = [];

  for (const item of items) {
    if (item.type === "dir") {
      // 跳过隐藏目录
      if (item.name.startsWith(".")) { continue; }
      // 递归获取子目录并合并
      const subFiles = await fetchAllMarkdownFilesRecursive(item.path);
      results = [...results, ...subFiles];
    } else if (item.name.endsWith(".md") || item.name.endsWith(".mdx")) {
      // 将父级目录名作为 category，或者根据路径自定义
      const pathParts = item.path.split('/');
      const category = pathParts.length > 1 ? pathParts.at(-2) : "Uncategorized";
      results.push({ category, file: item });
    }
  }
  return results;
}