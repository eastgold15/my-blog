/**
 * 博客文章详情页
 * 三列布局：左章节导航 | 中内容 | 右目录
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
import { Code } from "@/components/content/code";
import { TableOfContents } from "@/components/content/table-of-contents";
import { ChapterNav } from "@/components/content/chapter-nav";
import { getAllPosts } from "@/lib/posts";
import { generateTOC } from "@/lib/toc";
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
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // 一次性获取所有文章，避免重复请求
  const allPosts = await getAllPosts();
  const post = allPosts.find((p) => p.slug === slug || p.slug === decodedSlug);

  if (!post) {
    notFound();
  }

  // 如果内容为空，说明获取失败了
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

  // 获取同分类文章（用于章节导航）
  const categoryPosts = allPosts
    .filter((p) => p.category === post.category)
    .map((p) => ({ slug: p.slug, title: p.title }));

  // 文章导航（上一篇/下一篇）
  const currentIndex = allPosts.findIndex(
    (p) => p.slug === slug || p.slug === decodedSlug
  );
  const navigation = {
    prev: currentIndex > 0 ? allPosts[currentIndex - 1] : undefined,
    next:
      currentIndex < allPosts.length - 1
        ? allPosts[currentIndex + 1]
        : undefined,
  };

  // 生成目录
  const toc = generateTOC(post.content);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-450">
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

        {/* 三列布局：章节导航 | 内容 | 目录 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 左侧章节导航 */}
          {categoryPosts.length > 1 && (
            <aside className="hidden lg:col-span-2 lg:block">
              <ChapterNav
                categoryName={post.category}
                currentSlug={post.slug}
                posts={categoryPosts}
              />
            </aside>
          )}

          {/* 中间文章内容 */}
          <article
            className={
              categoryPosts.length > 1 ? "lg:col-span-8" : "lg:col-span-10"
            }
          >
            {/* 文章标题 */}
            <header className="mb-8">
              <h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
                {post.title}
              </h1>
              <PostMeta post={post} />
            </header>

            {/* 文章内容 */}
            <div className="markdown-body w-full">
              <ReactMarkdown
                components={{
                  code: Code,
                }}
                remarkPlugins={[remarkGfm, remarkObsidian]}
                rehypePlugins={[rehypeHighlight, rehypeSlug]}
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

          {/* 右侧目录导航 */}
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
