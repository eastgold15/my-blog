/**
 * 导航数据获取
 * 从本地 vault 缓存读取目录结构
 */

import type { NavItem } from "@/types/navigation";
import { buildNavTree } from "./vault-cache";

// 导航缓存
let navCache: NavItem[] | null = null;

/**
 * 获取导航结构（带缓存）
 */
export async function getNavigation(): Promise<NavItem[]> {
  if (navCache) {
    return navCache;
  }

  navCache = buildNavTree();
  return navCache;
}

/**
 * 清除缓存（用于重新加载）
 */
export function clearNavigationCache() {
  navCache = null;
}
