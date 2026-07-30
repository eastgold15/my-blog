/**
 * 博客文章详情页(掘金式三栏布局)
 *
 * ┌─ 左 240px ─┬─ 中 flex-1(居中)─┬─ 右 240px ─┐
 * │  章节目录  │                  │  本文目录  │
 * │  (可收起)  │   文章正文       │  (可收起)  │
 * └────────────┴──────────────────┴────────────┘
 * 左右栏由 CollapsibleSidebar 渲染,默认收起成 48px 宽竖条(只露圆形按钮)
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkObsidian from "remark-obsidian";
import { PostMeta } from "@/components/blog/post-meta";
import { PostNavigation } from "@/components/blog/post-navigation";
import { ChapterNav } from "@/components/content/chapter-nav";
import { Code } from "@/components/content/code";
import { CollapsibleSidebar } from "@/components/content/collapsible-sidebar";
import { TableOfContents } from "@/components/content/table-of-contents";
import { getAllPosts } from "@/lib/posts";
import { generateTOC } from "@/lib/toc";
import type { BlogPost } from "@/types/blog";
import "highlight.js/styles/github-dark.css";

// 生成静态参数
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: String(post.slug) }));
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allPosts = await getAllPosts();
  const post = allPosts.find(
    (p) => p.slug === slug || p.slug === decodeURIComponent(slug)
  );

  if (!post) {
    return { title: "文章未找到" };
  }

  return {
    description: post.excerpt,
    title: post.title,
  };
}

/** 系列文章判定:只看 frontmatter series 字段(系列是"渲染模式标记") */
function isArticle(
  _vaultDir?: string,
  data?: Record<string, unknown>
): boolean {
  return Boolean(data?.series);
}

/** 系列名(从 frontmatter series) */
function getChapterName(
  _vaultDir?: string,
  data?: Record<string, unknown>
): string {
  return data?.series ? String(data.series) : "";
}

/** 同 vault 目录下的所有笔记(getAllPosts 已只返回 published:true) */
function getChapterSiblings(
  currentPost: BlogPost,
  allPosts: BlogPost[]
): BlogPost[] {
  if (!currentPost.vaultDir) return [currentPost];
  return allPosts
    .filter((p) => p.vaultDir === currentPost.vaultDir)
    .sort((a, b) => a.slug.localeCompare(b.slug, "zh-CN"));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // 一次性获取所有文章
  const allPosts = await getAllPosts();
  const post = allPosts.find((p) => p.slug === slug || p.slug === decodedSlug);

  if (!post) {
    notFound();
  }

  // 内容加载失败的处理
  if (!post.content || post.content === "") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 font-bold text-2xl text-gray-900 dark:text-white">
          {post.title}
        </h1>
        <div className="mb-8 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700 dark:border-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
          <p className="font-medium">⚠️ 文章内容加载失败</p>
          <p className="mt-2 text-sm">
            这可能是由于网络问题或 GitHub API 限制导致的。请稍后刷新页面重试。
          </p>
        </div>
        <a
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          href="/"
        >
          返回首页
        </a>
      </div>
    );
  }

  // 文章类型 & 系列名
  const articleType = isArticle(
    post.vaultDir,
    post as unknown as Record<string, unknown>
  );
  const chapterName = getChapterName(
    post.vaultDir,
    post as unknown as Record<string, unknown>
  );

  // 文章导航(上一篇/下一篇)
  const navigation = {
    next:
      currentIndex(allPosts, post) < allPosts.length - 1
        ? allPosts[currentIndex(allPosts, post) + 1]
        : undefined,
    prev:
      currentIndex(allPosts, post) > 0
        ? allPosts[currentIndex(allPosts, post) - 1]
        : undefined,
  };

  // 同系列文章(左侧导航用)
  const chapterPosts = articleType
    ? getChapterSiblings(post, allPosts).map((p) => ({
        slug: p.slug,
        title: p.title,
      }))
    : [];

  // 文章目录
  const toc = generateTOC(post.content);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* 返回首页链接 */}
      <Link
        className="mb-6 inline-flex items-center text-gray-600 text-sm transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        href="/"
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
        返回首页
      </Link>

      {/* 三栏布局:左 / 中 / 右 */}
      <div className="flex items-start gap-4">
        {/* 左:章节目录(仅系列文章 + 同目录多于 1 篇才显示) */}
        {articleType && chapterPosts.length > 1 && (
          <CollapsibleSidebar
            collapsedIcon={<span className="text-base">📑</span>}
            icon={<span>📑</span>}
            side="left"
            storageKey="chapter"
            title={chapterName || "章节目录"}
          >
            <ChapterNav
              chapterName={chapterName}
              currentSlug={post.slug}
              posts={chapterPosts}
            />
          </CollapsibleSidebar>
        )}

        {/* 中:文章主内容(居中) */}
        <main className="min-w-0 flex-1">
          <article className="mx-auto w-full max-w-3xl">
            <header className="mb-8">
              <h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
                {post.title}
              </h1>
              <PostMeta post={post} />
            </header>

            <div className="markdown-body w-full">
              <ReactMarkdown
                components={{
                  code: Code,
                }}
                rehypePlugins={[rehypeHighlight, rehypeSlug]}
                remarkPlugins={[remarkGfm, remarkObsidian]}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="mt-12 border-gray-200 border-t pt-8 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 text-sm dark:bg-gray-800 dark:text-gray-300"
                      key={tag}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 文章导航 */}
            <PostNavigation navigation={navigation} />
          </article>
        </main>

        {/* 右:本文目录(有 toc 才显示) */}
        {toc.length > 0 && (
          <CollapsibleSidebar
            collapsedIcon={<span className="text-base">📋</span>}
            icon={<span>📋</span>}
            side="right"
            storageKey="toc"
            title="本文目录"
          >
            <TableOfContents title="目录" toc={toc} />
          </CollapsibleSidebar>
        )}
      </div>
    </div>
  );
}

/** 找当前文章在已排序列表中的索引 */
function currentIndex(allPosts: BlogPost[], post: BlogPost): number {
  return allPosts.findIndex((p) => p.slug === post.slug);
}
