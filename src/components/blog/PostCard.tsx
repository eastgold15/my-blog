/**
 * 博客文章卡片组件
 */

import Link from "next/link";
import type { BlogPost } from "@/types/blog";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200"
    >
      <article>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
            {post.category}
          </span>
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(post.date).toLocaleDateString("zh-CN")}
          </time>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          {post.readingTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {post.readingTime} 分钟阅读
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
