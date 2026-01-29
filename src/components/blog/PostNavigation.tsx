/**
 * 文章导航组件（上一篇/下一篇）
 */

import Link from "next/link";
import type { PostNavigation as PostNavigationType } from "@/types/blog";

export function PostNavigation({ navigation }: { navigation: PostNavigationType }) {
  if (!navigation.prev && !navigation.next) {
    return null;
  }

  return (
    <nav className="flex justify-between items-start gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      {navigation.prev ? (
        <Link
          href={`/posts/${navigation.prev.slug}`}
          className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            ← 上一篇
          </div>
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {navigation.prev.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {navigation.next ? (
        <Link
          href={`/posts/${navigation.next.slug}`}
          className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-right"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            下一篇 →
          </div>
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {navigation.next.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
