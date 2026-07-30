/**
 * 测试 base 解析管线
 * 跑法:cd apps/blog && bun scripts/test-base.ts
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  collectDimensionValues,
  parsePublishedBase,
} from "../src/lib/base-parser";

const VAULT = "H:/main/knowledge_base";
const BASE_FILE = `${VAULT}/views.published.base`;

function walk(dir: string, out: string[] = []): string[] {
  const skip = new Set([
    ".obsidian",
    ".git",
    ".agents",
    ".claude",
    "node_modules",
    "scripts",
    "copilot",
    "assets",
    "public",
  ]);
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

console.log("=== 1. 解析 base 文件 ===");
const schema = parsePublishedBase(BASE_FILE);
console.log("path:", schema.path);
console.log("dimensions:");
for (const d of schema.dimensions) {
  console.log(`  - ${d.displayName} (key: ${d.name})`);
}
console.log("views:");
for (const v of schema.views) {
  console.log(`  - [${v.slug}] ${v.name}  order: ${v.order.join(" / ")}`);
}

console.log("\n=== 2. 扫 vault 收集 published 笔记 ===");
const files = walk(VAULT);
console.log(`总文件: ${files.length}`);

const posts: Array<{
  name: string;
  path: string;
  data: Record<string, unknown>;
}> = [];
for (const f of files) {
  try {
    const { data } = matter(readFileSync(f, "utf8"));
    if (data.published === true) {
      posts.push({
        data,
        name: f.split(/[\\/]/).pop()!.replace(/\.md$/, ""),
        path: f,
      });
    }
  } catch {
    // 跳过解析失败的文件
  }
}
console.log(`已发布: ${posts.length}`);

console.log("\n=== 3. 各维度取值 ===");
const filledDimensions = collectDimensionValues(
  schema.dimensions,
  posts.map((p) => p.data)
);
for (const d of filledDimensions) {
  console.log(`${d.displayName}:`);
  for (const v of d.values) {
    console.log(`  - ${v}`);
  }
}

console.log("\n=== 4. 已发布笔记清单 ===");
for (const p of posts) {
  console.log(`- ${p.name}`);
  console.log(
    `  形态: ${p.data["形态"]}  场景: ${p.data["场景"]}  tags: ${JSON.stringify(p.data.tags)}`
  );
}
