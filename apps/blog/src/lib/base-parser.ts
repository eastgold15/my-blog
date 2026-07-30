/**
 * 解析 vault/views.published.base,生成网页 schema
 *
 * 这是 base 驱动的核心:网页端只读这个文件,
 * 改 base 的 properties 段 = 改网站可筛维度,
 * 改 base 的 views 段 = 改网站 tab 栏。
 */

import { readFileSync } from "node:fs";
import { parseBase } from "@aliou/obsdx-base-ast";

/** 单个维度的展示名 + 可选的所有值(过滤后填) */
export type Dimension = {
  name: string;
  displayName: string;
  values: string[];
};

/** 解析后的 view 描述(给网页用) */
export type View = {
  name: string;
  slug: string;
  filters: unknown;
  order: string[];
  requiresContext: boolean;
};

export type ParsedBase = {
  /** 文件路径(给报错用) */
  path: string;
  /** 全局过滤器 */
  filters: unknown;
  /** 网页可筛维度(来自 properties 段) */
  dimensions: Dimension[];
  /** 视图列表(来自 views 段) */
  views: View[];
  /** 原始 AST(给高级用法保留) */
  raw: ReturnType<typeof parseBase>;
};

/** 解析 base 文件,生成网页 schema */
export function parsePublishedBase(basePath: string): ParsedBase {
  const source = readFileSync(basePath, "utf8");
  const ast = parseBase(basePath, source);

  // properties 段 → 维度
  // displayName 默认等于 name
  const properties = ast.properties ?? {};
  const dimensions: Dimension[] = Object.entries(properties).map(
    ([name, prop]) => ({
      displayName: prop.displayName ?? name,
      name,
      values: [], // 由调用方根据实际笔记数据填充
    })
  );

  // views 段 → 视图列表
  // slug 从 raw 拿(库不识别自定义字段)
  const views: View[] = (ast.views ?? []).map((v) => ({
    filters: v.filters,
    name: v.name,
    order: v.order ?? [],
    requiresContext: v.requiresContext,
    slug: (v.raw?.slug as string) ?? slugify(v.name),
  }));

  return {
    dimensions,
    filters: ast.filters,
    path: basePath,
    raw: ast,
    views,
  };
}

/** 给 view name 生成 URL 友好的 slug(兜底用) */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** 扫描 vault 笔记,统计每个维度的所有取值 */
export function collectDimensionValues(
  dimensions: Dimension[],
  posts: Array<Record<string, unknown>>
): Dimension[] {
  return dimensions.map((dim) => {
    const values = new Set<string>();
    for (const post of posts) {
      const v = post[dim.name];
      if (Array.isArray(v)) {
        for (const item of v) values.add(String(item));
      } else if (v != null) {
        values.add(String(v));
      }
    }
    return { ...dim, values: [...values].sort() };
  });
}
