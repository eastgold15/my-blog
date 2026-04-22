/**
 * 博客文章元数据组件
 */

import type { BlogPost } from "@/types/blog";

export function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 border-gray-200 border-b pb-6 text-gray-600 text-sm dark:border-gray-700 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <span className="font-medium">分类:</span>
        <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700 text-xs dark:bg-blue-900 dark:text-blue-300">
          {post.category}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">发布于:</span>
        <time>{new Date(post.date).toLocaleDateString("zh-CN")}</time>
      </div>

      {post.readingTime && (
        <div className="flex items-center gap-2">
          <span className="font-medium">阅读时间:</span>
          <span>{post.readingTime} 分钟</span>
        </div>
      )}

      {post.author && (
        <div className="flex items-center gap-2">
          <span className="font-medium">作者:</span>
          <span>{post.author}</span>
        </div>
      )}
    </div>
  );
}
