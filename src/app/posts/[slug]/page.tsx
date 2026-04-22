/**
 * 博客文章详情页
 * 动态路由渲染 MDX 内容
 * 左侧显示目录，右侧显示内容
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { PostMeta } from "@/components/blog/post-meta";
import { PostNavigation } from "@/components/blog/post-navigation";
import { TableOfContents } from "@/components/content/table-of-contents";
import { getAllPosts, getPostBySlug, getPostNavigation } from "@/lib/posts";
import { generateTOC } from "@/lib/toc";
import "highlight.js/styles/github-dark.css";

// 生成静态参数
export async function generateStaticParams() {
  const posts = await getAllPosts();

  // 返回所有 slug
  return posts.map((post) => ({ slug: String(post.slug) }));
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章未找到",
    };
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
  const post = await getPostBySlug(slug);

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

  const navigation = await getPostNavigation(slug);

  // 生成目录
  const toc = generateTOC(post.content);

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 左侧目录导航 - 只在桌面端显示 */}
          {toc.length > 0 && (
            <aside className="hidden lg:col-span-3 lg:block">
              <TableOfContents title="目录" toc={toc} />
            </aside>
          )}

          {/* 右侧文章内容 */}
          <article className={`lg:col-span-${toc.length > 0 ? "9" : "12"}`}>
            {/* 返回首页链接 */}
            <Link
              className="mb-8 inline-flex items-center text-gray-600 text-sm transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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

            {/* 文章标题 */}
            <header className="mb-8">
              <h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
                {post.title}
              </h1>
              <PostMeta post={post} />
            </header>

            {/* 文章内容 */}
            <div className="prose prose-lg dark:prose-invert markdown-body max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight, rehypeSlug]}
                remarkPlugins={[remarkGfm]}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="mt-12 border-gray-200 border-t pt-8 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
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
        </div>
      </div>
    </div>
  );
}
