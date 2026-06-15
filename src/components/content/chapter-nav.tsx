/**
 * 章节导航组件
 * 显示同一分类（章节）下的所有文章
 * 在桌面端固定在左侧边栏
 */

import Link from "next/link";

interface ChapterPost {
  slug: string;
  title: string;
}

interface ChapterNavProps {
  /** 分类名称（如 "4-全栈/01-elysia"） */
  categoryName: string;
  /** 当前文章的 slug */
  currentSlug: string;
  /** 同一分类下的所有文章 */
  posts: ChapterPost[];
}

const NUM_PREFIX_REGEX = /^\d+-/;

/**
 * 将分类路径转为可读的章节名称
 * "4-全栈/01-elysia" → "全栈 / elysia"
 */
function formatCategoryName(category: string): string {
  return category
    .split("/")
    .map((part) => part.replace(NUM_PREFIX_REGEX, ""))
    .join(" / ");
}

export function ChapterNav({
  categoryName,
  currentSlug,
  posts,
}: ChapterNavProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
        章节
      </h3>
      <h4 className="mb-3 font-semibold text-gray-900 text-sm dark:text-white">
        {formatCategoryName(categoryName)}
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
