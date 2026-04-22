/**
 * 导航数据获取
 * 基于 GitHub 仓库结构生成导航配置
 */

import type { NavItem } from "@/types/navigation";
import { buildNavigationTree } from "./github";

// 导航缓存
let navCache: NavItem[] | null = null;
let filepathMapCache: Map<string, string> | null = null;

/**
 * 获取导航结构（带缓存）
 */
export async function getNavigation(): Promise<NavItem[]> {
  if (navCache) {
    return navCache;
  }

  navCache = await buildNavigationTree();
  return navCache;
}

/**
 * 获取文件路径映射（带缓存）
 * 用于解析 Obsidian 双链
 */
export async function getFilepathMap(): Promise<Map<string, string>> {
  if (filepathMapCache) {
    return filepathMapCache;
  }

  filepathMapCache = await getFilepathMap();
  return filepathMapCache;
}

/**
 * 根据文件名查找完整路径
 * 支持模糊匹配
 */
export async function findFilePath(fileName: string): Promise<string | null> {
  const map = await getFilepathMap();

  // 直接匹配
  if (map.has(fileName)) {
    return map.get(fileName)!;
  }

  // 尝试移除空格匹配
  const normalized = fileName.replace(/\s+/g, "-");
  if (map.has(normalized)) {
    return map.get(normalized)!;
  }

  // 模糊匹配：查找包含该文件名的路径
  for (const [key, path] of map.entries()) {
    if (key.toLowerCase() === fileName.toLowerCase()) {
      return path;
    }
  }

  return null;
}

/**
 * 清除缓存（用于重新加载）
 */
export function clearNavigationCache() {
  navCache = null;
  filepathMapCache = null;
}
