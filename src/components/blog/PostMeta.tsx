/**
 * 博客文章元数据组件
 */

import type { BlogPost } from "@/types/blog";

export function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <span className="font-medium">分类:</span>
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
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
