/**
 * 目录（Table of Contents）生成工具
 * 从 Markdown 内容中提取标题，生成目录结构
 *
 * 使用 github-slugger 生成 ID（与 rehype-slug 相同算法，锚点 ID 天然一致）
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
 */
export function generateTOC(content: string): TocItem[] {
  const headings: TocItem[] = [];
  const slugger = new GithubSlugger();

  // 匹配 Markdown 标题 # ## ### 等
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;

  for (const match of content.matchAll(headingRegex)) {
    const level = match[1].length;
    const title = match[2].trim();

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
function buildHierarchy(headings: TocItem[]): TocItem[] {
  const result: TocItem[] = [];
  const stack: { item: TocItem; level: number }[] = [];

  for (const heading of headings) {
    const node: TocItem = { ...heading, children: [] };

    while (stack.length > 0) {
      const top = stack.at(-1);
      if (!top?.level || top.level < heading.level) {
        break;
      }
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(node);
    } else {
      const parent = stack.at(-1)?.item;
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
