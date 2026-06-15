/**
 * 章节导航组件
 * 显示同一章节下的所有文章
 * 仅在文章详情页左侧边栏显示
 */

import Link from "next/link";

interface ChapterPost {
  slug: string;
  title: string;
}

interface ChapterNavProps {
  /** 章节名称（如 "elysia"） */
  chapterName: string;
  /** 当前文章的 slug */
  currentSlug: string;
  /** 同一章节下的所有文章 */
  posts: ChapterPost[];
}

export function ChapterNav({
  chapterName,
  currentSlug,
  posts,
}: ChapterNavProps) {
  if (posts.length <= 1) {
    return null;
  }

  return (
    <nav className="hide-scrollbar sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
        章节
      </h3>
      <h4 className="mb-3 font-semibold text-gray-900 text-sm dark:text-white">
        {chapterName}
      </h4>
      <ul className="space-y-1 border-gray-200 border-l-2 dark:border-gray-700">
        {posts.map((post) => {
          const isActive = post.slug === currentSlug;
          return (
            <li key={post.slug}>
              <Link
                className={`block border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                  isActive
                    ? "-ml-0.5 border-blue-500 font-medium text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-white"
                }`}
                href={`/posts/${post.slug}`}
              >
                {post.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
