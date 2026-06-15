/**
 * 分类/目录页面
 *
 * 双模式：
 * - 文章目录（articleDirs）：书视图 → 左树形文件夹 | 中内容 | 右 TOC
 * - frontmatter category：文章列表
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkObsidian from "remark-obsidian";
import { PostCard } from "@/components/blog/post-card";
import { PostMeta } from "@/components/blog/post-meta";
import { Code } from "@/components/content/code";
import { FileTree } from "@/components/content/file-tree";
import { TableOfContents } from "@/components/content/table-of-contents";
import { config } from "@/configs/config";
import { processObsidianSyntax } from "@/lib/obsidian";
import { getAllPosts } from "@/lib/posts";
import { generateTOC } from "@/lib/toc";
import {
  buildFileTree,
  getFirstMdFile,
  readVaultFile,
} from "@/lib/vault-cache";
import type { BlogPost } from "@/types/blog";
import "highlight.js/styles/github-dark.css";

const NUM_PREFIX_REGEX = /^\d+-/;
const CACHE_ROOT = join(process.cwd(), ".vault-cache");

// ─── 工具 ────────────────────────────────────────────

/** 是否为 vault 中的目录 */
function isDir(path: string): boolean {
  const fullPath = join(CACHE_ROOT, path);
  return existsSync(fullPath) && statSync(fullPath).isDirectory();
}

/** 是否为 vault 中的 .md 文件 */
function isMdFile(path: string): boolean {
  return existsSync(join(CACHE_ROOT, `${path}.md`));
}

/** 某个路径是否在 article 目录下 */
function inArticleDir(path: string): boolean {
  return config.content.dirs.article.some(
    (d) => path === d || path.startsWith(`${d}/`)
  );
}

// ─── 生成静态参数 ─────────────────────────────────────

function getAllArticlePaths(): string[][] {
  const paths: string[][] = [];

  function scan(current: string, segments: string[]) {
    const fullPath = join(CACHE_ROOT, current);
    if (!existsSync(fullPath)) return;

    const entries = readdirSync(fullPath).sort();
    for (const entry of entries) {
      if (entry.startsWith("_") || entry.startsWith(".")) continue;
      const entryPath = join(CACHE_ROOT, current, entry);
      try {
        if (statSync(entryPath).isDirectory()) {
          const segs = [...segments, entry];
          paths.push(segs);
          scan(`${current}/${entry}`, segs);
        } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
          // File path without extension
          paths.push([...segments, entry.replace(/\.(md|mdx)$/, "")]);
        }
      } catch {
        // skip
      }
    }
  }

  for (const dir of config.content.dirs.article) {
    paths.push([dir]); // root dir
    scan(dir, [dir]);
  }

  return paths;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const params: { category: string[] }[] = [];

  // frontmatter categories
  const cats = new Set(posts.map((p) => p.category));
  for (const c of cats) {
    params.push({ category: [c] });
  }

  // article dirs and files
  for (const p of getAllArticlePaths()) {
    params.push({ category: p });
  }

  return params;
}

// ─── 元数据 ───────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string[] }>;
}) {
  const { category } = await params;
  const name = decodeURIComponent(category.join("/")).replace(
    NUM_PREFIX_REGEX,
    ""
  );
  return { title: `${name} - 我的博客`, description: `${name} 的内容` };
}

// ─── 读书视图 ────────────────────────────────────────

async function BookView({
  activePath,
  allPosts,
}: {
  activePath: string; // vault 路径，如 "4-全栈" 或 "4-全栈/01-elysia"
  allPosts: BlogPost[];
}) {
  // 确定显示哪个 .md 文件
  let filePath: string;
  if (isMdFile(activePath)) {
    filePath = `${activePath}.md`;
  } else {
    // 目录 → 找第一个文件
    const found = getFirstMdFile(activePath);
    filePath = found || "";
  }

  if (!filePath) {
    return (
      <div className="py-12 text-center text-gray-500">该目录暂无内容</div>
    );
  }

  // 取文章根目录（tab 名）
  const rootDir =
    config.content.dirs.article.find((d) => activePath.startsWith(d)) || "";
  const rootLabel = rootDir.replace(NUM_PREFIX_REGEX, "");

  // 读文件 + 渲染
  const rawContent = readVaultFile(filePath);
  const content = processObsidianSyntax(rawContent);
  let fm: Record<string, unknown> = {};
  try {
    fm = matter(content).data;
  } catch {
    // 文件 frontmatter 格式错误时静默降级
  }
  const title =
    fm.title ||
    filePath
      .split("/")
      .pop()
      ?.replace(/\.(md|mdx)$/, "") ||
    "";
  const toc = generateTOC(content);
  const tree = buildFileTree(rootDir);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-450">
        {/* 面包屑 */}
        <div className="mb-4 flex items-center gap-1 text-gray-500 text-sm dark:text-gray-400">
          <Link className="hover:text-blue-600" href="/">
            首页
          </Link>
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>1</title>
            <path
              d="M9 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <Link
            className="hover:text-blue-600"
            href={`/${encodeURIComponent(rootDir)}`}
          >
            {rootLabel}
          </Link>
          {filePath
            .replace(rootDir, "")
            .split("/")
            .filter(Boolean)
            .slice(0, -1) // exclude filename itself
            .map((seg) => (
              <span className="flex items-center gap-1" key={seg}>
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>1</title>
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span>{seg.replace(NUM_PREFIX_REGEX, "")}</span>
              </span>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 左侧：文件树 */}
          {tree.length > 0 && (
            <aside className="hidden lg:col-span-2 lg:block">
              <FileTree
                baseDir={rootDir}
                currentPath={filePath.replace(/\.(md|mdx)$/, "")}
                nodes={tree}
              />
            </aside>
          )}

          {/* 中间：内容 */}
          <article className="lg:col-span-8">
            <header className="mb-8">
              <h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
                {title}
              </h1>
              {/* 尝试从全局文章列表找匹配项显示元数据 */}
              {allPosts
                .filter(
                  (p) =>
                    p.vaultDir === filePath.split("/").slice(0, -1).join("/")
                )
                .slice(0, 1)
                .map((p) => (
                  <PostMeta key={p.slug} post={p} />
                ))}
            </header>

            <div className="markdown-body w-full">
              <ReactMarkdown
                components={{ code: Code }}
                rehypePlugins={[rehypeHighlight, rehypeSlug]}
                remarkPlugins={[remarkGfm, remarkObsidian]}
              >
                {content}
              </ReactMarkdown>
            </div>
          </article>

          {/* 右侧：目录 */}
          {toc.length > 0 && (
            <aside className="hidden lg:col-span-2 lg:block">
              <TableOfContents title="目录" toc={toc} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 文章列表视图 ─────────────────────────────────────

async function PostListView({
  decodedCategory,
  allPosts,
}: {
  decodedCategory: string;
  allPosts: BlogPost[];
}) {
  const posts = allPosts.filter((p) => p.category === decodedCategory);

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-12">
          <h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
            {decodedCategory.replace(NUM_PREFIX_REGEX, "")}
          </h1>
          <p className="text-gray-600 text-lg dark:text-gray-400">
            共 {posts.length} 篇文章
          </p>
        </section>

        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              暂无文章，敬请期待...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string[] }>;
}) {
  const { category } = await params;
  const decoded = decodeURIComponent(category.join("/"));
  const allPosts = await getAllPosts();

  // Article 目录 → 书视图
  if (inArticleDir(decoded) && (isDir(decoded) || isMdFile(decoded))) {
    return <BookView activePath={decoded} allPosts={allPosts} />;
  }

  // 其他 → 文章列表
  return <PostListView allPosts={allPosts} decodedCategory={decoded} />;
}
