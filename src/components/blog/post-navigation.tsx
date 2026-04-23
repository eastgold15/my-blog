/**
 * 文章导航组件（上一篇/下一篇）
 */

import Link from "next/link";
import type { PostNavigationType } from "@/types/blog";

export function PostNavigation({
  navigation,
}: {
  navigation: PostNavigationType;
}) {
  if (!(navigation.prev || navigation.next)) {
    return null;
  }

  return (
    <nav className="mt-12 flex items-start justify-between gap-4 border-gray-200 border-t pt-8 dark:border-gray-700">
      {navigation.prev ? (
        <Link
          className="flex-1 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          href={`/posts/${navigation.prev.slug}`}
        >
          <div className="mb-1 text-gray-500 text-sm dark:text-gray-400">
            ← 上一篇
          </div>
          <div className="line-clamp-1 font-medium text-gray-900 dark:text-white">
            {navigation.prev.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {navigation.next ? (
        <Link
          className="flex-1 rounded-lg bg-gray-50 p-4 text-right transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          href={`/posts/${navigation.next.slug}`}
        >
          <div className="mb-1 text-gray-500 text-sm dark:text-gray-400">
            下一篇 →
          </div>
          <div className="line-clamp-1 font-medium text-gray-900 dark:text-white">
            {navigation.next.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
