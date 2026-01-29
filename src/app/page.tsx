/**
 * 博客首页
 * 展示所有博客文章列表
 */

import { getAllPosts, getAllCategories } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import Link from "next/link";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 首页头部 */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          欢迎来到我的博客
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          分享技术知识和生活感悟
        </p>
      </section>

      {/* 分类导航 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          文章分类
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/posts"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            全部 ({posts.length})
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/posts?category=${category.slug}`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {category.name} ({category.count})
            </Link>
          ))}
        </div>
      </section>

      {/* 文章列表 */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          最新文章
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              暂无文章，敬请期待...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
