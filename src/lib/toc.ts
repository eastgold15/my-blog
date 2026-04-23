/**
 * 目录（Table of Contents）生成工具
 * 从 Markdown 内容中提取标题，生成目录结构
 */

import GithubSlugger from "github-slugger";

export interface TocItem {
  /** 子目录项 */
  children?: TocItem[];
  /** 唯一 ID（用于锚点链接） */
  id: string;
  /** 标题级别 (1-6) */
  level: number;
  /** 标题文本 */
  title: string;
}

/**
 * 从 Markdown 内容生成目录
 * 使用 github-slugger 生成与 GitHub 一致的 ID
 */
export function generateTOC(content: string): TocItem[] {
  const headings: TocItem[] = [];
  const slugger = new GithubSlugger();

  // 匹配 Markdown 标题 # ## ### 等
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;

  for (const match of content.matchAll(headingRegex)) {
    const level = match[1].length;
    const title = match[2].trim();

    // 跳过空标题
    if (!title) {
      continue;
    }

    // 使用 github-slugger 生成 ID（会自动处理重复）
    const id = slugger.slug(title);

    headings.push({
      title,
      level,
      id,
      children: [],
    });
  }

  // 构建层级结构
  return buildHierarchy(headings);
}

/**
 * 构建层级结构
 * 将扁平的标题列表转换为树形结构
 */

function  buildHierarchy(headings: TocItem[]): TocItem[] {
  const result: TocItem[] = [];
  const stack: { item: TocItem; level: number }[] = [];

  for (const heading of headings) {
    const node: TocItem = { ...heading, children: [] };

    // 找到合适的父节点
    while (stack.length > 0) {
      const top = stack.at(-1);
      if (!top?.level || top.level < heading.level) {
        break;
      }
      stack.pop();
    }

    if (stack.length === 0) {
      // 没有父节点，添加到根级别
      result.push(node);
    } else {
      // 有父节点，添加到父节点的 children
      const parent = stack.at(-1)?.item;
      if (parent && !parent.children) {
        parent.children = [];
      }
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    }

    stack.push({ item: node, level: heading.level });
  }

  return result;
}

/**
 * 获取所有标题（扁平列表）
 */
export function getAllHeadings(content: string): TocItem[] {
  return generateTOC(content);
}

/**
 * 获取指定级别的最大深度
 */
export function getMaxDepth(toc: TocItem[]): number {
  let maxDepth = 0;

  function traverse(items: TocItem[], depth: number) {
    for (const item of items) {
      maxDepth = Math.max(maxDepth, depth);
      if (item.children && item.children.length > 0) {
        traverse(item.children, depth + 1);
      }
    }
  }

  traverse(toc, 1);
  return maxDepth;
}
