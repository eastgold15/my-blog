/**
 * MDX 组件配置
 * 自定义 MDX 渲染时的组件映射
 */

import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 你可以在这里自定义 MDX 组件
    // 例如：h1: ({ children }) => <h1 className="text-4xl font-bold">{children}</h1>,
    ...components,
  };
}
