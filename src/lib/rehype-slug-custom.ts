/**
 * 自定义 rehype-slug 插件
 * 确保生成的 ID 与 TOC 组件的 ID 一致
 */

import type { Element, Root } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toString as hastToString } from "hast-util-to-string";
import type { Plugin } from "unified";

/**
 * 从标题文本生成锚点 ID（与 toc.ts 中的规则一致）
 */
function generateAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-一 - 龥]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 自定义 rehype-slug 插件
 * 处理重复 ID，添加计数后缀
 */
export const rehypeSlugCustom: Plugin<[], Root> = () => {
  const idCount = new Map<string, number>();

  return (tree) => {
    for (const node of tree.children) {
      if (
        node.type === "element" &&
        headingRank(node as Element) &&
        !(node as Element).properties?.id
      ) {
        const title = hastToString(node);
        let id = generateAnchorId(title);

        // 如果 ID 已存在，添加计数后缀
        const count = idCount.get(id) || 0;
        if (count > 0) {
          id = `${id}-${count}`;
        }
        idCount.set(id, count + 1);

        (node as Element).properties.id = id;
      }
    }
  };
};
