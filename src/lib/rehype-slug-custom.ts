/**
 * 自定义 rehype-slug 插件
 * 使用 github-slugger 确保生成的 ID 与 TOC 组件的 ID 一致
 */

import GithubSlugger from "github-slugger";
import type { Element, Root } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toString as hastToString } from "hast-util-to-string";
import type { Plugin } from "unified";

/**
 * 自定义 rehype-slug 插件
 * 使用 github-slugger 生成与 GitHub 一致的 ID
 */
export const rehypeSlugCustom: Plugin<[], Root> = () => {
  const slugger = new GithubSlugger();

  return (tree) => {
    for (const node of tree.children) {
      if (
        node.type === "element" &&
        headingRank(node as Element) &&
        !(node as Element).properties?.id
      ) {
        const title = hastToString(node);
        // 使用 github-slugger 生成 ID（会自动处理重复）
        const id = slugger.slug(title);
        (node as Element).properties.id = id;
      }
    }
  };
};
