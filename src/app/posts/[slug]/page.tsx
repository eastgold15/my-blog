/**
 * 博客文章详情页
 * 动态路由渲染 MDX 内容
 */

import { getAllPosts, getPostBySlug, getPostNavigation } from "@/lib/posts";
import { PostMeta } from "@/components/blog/PostMeta";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// 生成静态参数
export async function generateStaticParams() {
  const posts = await getAllPosts();

  // 返回所有 slug
  return posts.map((post) => {
    return { slug: String(post.slug) };
  });
}

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
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

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // 如果内容为空，说明获取失败了
  if (!post.content || post.content === "") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded mb-8">
          <p className="font-medium">⚠️ 文章内容加载失败</p>
          <p className="text-sm mt-2">
            这可能是由于网络问题或 GitHub API 限制导致的。请稍后刷新页面重试。
          </p>
        </div>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首页
        </a>
      </div>
    );
  }

  const navigation = await getPostNavigation(slug);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 返回首页链接 */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        返回首页
      </Link>

      {/* 文章标题 */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        <PostMeta post={post} />
      </header>

      {/* 文章内容 */}
      <div className="prose prose-lg dark:prose-invert max-w-none markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
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
  );
}
