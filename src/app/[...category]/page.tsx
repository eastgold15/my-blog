/**
 * 分类/目录页面
 *
 * 支持两种模式：
 * - 文章目录（articleDirs 下的路径）：按"书"展示，子目录=章节，点进去默认显式第一个文件
 * - 其他分类：按 frontmatter category 过滤展示文章列表
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
import { Code } from "@/components/content/code";
import { TableOfContents } from "@/components/content/table-of-contents";
import { config } from "@/configs/config";
import { processObsidianSyntax } from "@/lib/obsidian";
import { getAllPosts } from "@/lib/posts";
import { generateTOC } from "@/lib/toc";
import { readVaultFile } from "@/lib/vault-cache";
import type { BlogPost } from "@/types/blog";
import "highlight.js/styles/github-dark.css";

const NUM_PREFIX_REGEX = /^\d+-/;
const CACHE_ROOT = join(process.cwd(), ".vault-cache");

// ─── 工具函数 ─────────────────────────────────────────

function isVaultDir(path: string): boolean {
  const fullPath = join(CACHE_ROOT, path);
  return existsSync(fullPath) && statSync(fullPath).isDirectory();
}

function getSubDirs(dirPath: string): string[] {
  const fullPath = join(CACHE_ROOT, dirPath);
  if (!existsSync(fullPath)) {
    return [];
  }

  return readdirSync(fullPath)
    .filter((name) => {
      try {
        return statSync(join(fullPath, name)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function getDirMdFiles(dirPath: string): string[] {
  const fullPath = join(CACHE_ROOT, dirPath);
  if (!existsSync(fullPath)) {
    return [];
  }

  return readdirSync(fullPath)
    .filter(
      (name) =>
        (name.endsWith(".md") || name.endsWith(".mdx")) &&
        !name.startsWith("_") &&
        !name.startsWith(".")
    )
    .sort();
}

// ─── 生成静态参数 ─────────────────────────────────────

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const params: { category: string[] }[] = [];

  // 1. frontmatter category 路径
  const categoryPaths = new Set<string>();
  for (const post of posts) {
    categoryPaths.add(post.category);
  }
  for (const cat of categoryPaths) {
    params.push({ category: [cat] });
  }

  // 2. 文章目录路径
  for (const articleDir of config.content.dirs.article) {
    params.push({ category: [articleDir] });
    const chapters = getSubDirs(articleDir);
    for (const chapter of chapters) {
      params.push({ category: [articleDir, chapter] });
    }
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
  const categoryName = decodeURIComponent(category.join("/"));

  return {
    title: `${categoryName.replace(NUM_PREFIX_REGEX, "")} - 我的博客`,
    description: `${categoryName.replace(NUM_PREFIX_REGEX, "")} 的内容`,
  };
}

// ─── 章节内容视图 ─────────────────────────────────────

async function ChapterContent({
  decodedCategory,
}: {
  decodedCategory: string;
}) {
  const subDirs = getSubDirs(decodedCategory);
  const mdFiles = getDirMdFiles(decodedCategory);

  // 有 .md 文件 → 展示第一个
  if (mdFiles.length > 0) {
    const firstFile = mdFiles[0];
    const filePath = `${decodedCategory}/${firstFile}`;
    const rawContent = readVaultFile(filePath);
    const content = processObsidianSyntax(rawContent);
    const { data: frontmatter } = matter(content);
    const title = frontmatter.title || firstFile.replace(/\.(md|mdx)$/, "");
    const toc = generateTOC(content);

    return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-450">
          <Link
            className="mb-6 inline-flex items-center text-gray-600 text-sm transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            href={`/${encodeURIComponent(decodedCategory.split("/")[0])}`}
          >
            <svg
              aria-hidden="true"
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            返回{decodedCategory.split("/")[0].replace(NUM_PREFIX_REGEX, "")}
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* 左侧文件列表 */}
            {mdFiles.length > 1 && (
              <aside className="hidden lg:col-span-2 lg:block">
                <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <h3 className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                    章节
                  </h3>
                  <h4 className="mb-3 font-semibold text-gray-900 text-sm dark:text-white">
                    {decodedCategory
                      .split("/")
                      .pop()
                      ?.replace(NUM_PREFIX_REGEX, "")}
                  </h4>
                  <ul className="space-y-1 border-gray-200 border-l-2 dark:border-gray-700">
                    {mdFiles.map((file) => {
                      const fileName = file.replace(/\.(md|mdx)$/, "");
                      const isActive = file === firstFile;
                      const slug = `/${encodeURIComponent(decodedCategory)}`;

                      return (
                        <li key={file}>
                          <Link
                            className={`block border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                              isActive
                                ? "-ml-0.5 border-blue-500 font-medium text-blue-600 dark:border-blue-400 dark:text-blue-400"
                                : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-white"
                            }`}
                            href={slug}
                          >
                            {fileName}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </aside>
            )}

            {/* 中间内容 */}
            <article
              className={
                mdFiles.length > 1 ? "lg:col-span-8" : "lg:col-span-10"
              }
            >
              <header className="mb-8">
                <h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
                  {title}
                </h1>
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

            {/* 右侧目录 */}
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

  // 只有子目录 → 展示子目录列表
  if (subDirs.length > 0) {
    return (
      <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 font-bold text-4xl text-gray-900 dark:text-white">
            {decodedCategory.replace(NUM_PREFIX_REGEX, "")}
          </h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subDirs.map((sub) => (
              <Link
                className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                href={`/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(sub)}`}
                key={sub}
              >
                <h2 className="font-semibold text-gray-900 text-lg dark:text-white">
                  {sub.replace(NUM_PREFIX_REGEX, "")}
                </h2>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 text-center">
      <p className="text-gray-600 dark:text-gray-400">该目录暂无内容</p>
    </div>
  );
}

// ─── 分类文章列表 ─────────────────────────────────────

async function CategoryPosts({
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
  const categoryPath = category.join("/");
  const decodedCategory = decodeURIComponent(categoryPath);
  const allPosts = await getAllPosts();

  // 判断是否是 article 目录路径
  const isArticleDir = config.content.dirs.article.some(
    (dir) => decodedCategory === dir || decodedCategory.startsWith(`${dir}/`)
  );

  if (isArticleDir && isVaultDir(decodedCategory)) {
    return <ChapterContent decodedCategory={decodedCategory} />;
  }

  return (
    <CategoryPosts allPosts={allPosts} decodedCategory={decodedCategory} />
  );
}
