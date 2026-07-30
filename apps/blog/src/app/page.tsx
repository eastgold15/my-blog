/**
 * 博客首页
 * 展示所有博客文章列表
 */

import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { getAllCategories, getAllPosts } from "@/lib/posts";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* 首页头部 */}
        <section className="mb-12">
          <h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
            欢迎来到我的博客
          </h1>
          <p className="text-gray-600 text-lg dark:text-gray-400">
            分享技术知识和生活感悟
          </p>
        </section>

        {/* 分类导航 */}
        <section className="mb-12">
          <h2 className="mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
            文章分类
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              href="/posts"
            >
              全部 ({posts.length})
            </Link>
            {categories.map((category) => (
              <Link
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                href={`/posts?category=${category.slug}`}
                key={category.slug}
              >
                {category.name} ({category.count})
              </Link>
            ))}
          </div>
        </section>

        {/* 文章列表 */}
        <section>
          <h2 className="mb-6 font-semibold text-2xl text-gray-900 dark:text-white">
            最新文章
          </h2>
          {posts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                暂无文章，敬请期待...
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
