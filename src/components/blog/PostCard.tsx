/**
 * 博客文章卡片组件
 */

import Link from "next/link";
import type { BlogPost } from "@/types/blog";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      className="block rounded-lg border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
      href={`/posts/${post.slug}`}
    >
      <article>
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-700 text-xs dark:bg-blue-900 dark:text-blue-300">
            {post.category}
          </span>
          <time className="text-gray-500 text-xs dark:text-gray-400">
            {new Date(post.date).toLocaleDateString("zh-CN")}
          </time>
        </div>

        <h2 className="mb-2 line-clamp-2 font-semibold text-gray-900 text-xl dark:text-white">
          {post.title}
        </h2>

        <p className="mb-4 line-clamp-3 text-gray-600 text-sm dark:text-gray-400">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                className="text-gray-500 text-xs dark:text-gray-400"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>

          {post.readingTime && (
            <span className="text-gray-500 text-xs dark:text-gray-400">
              {post.readingTime} 分钟阅读
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
