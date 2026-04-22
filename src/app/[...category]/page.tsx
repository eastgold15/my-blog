/**
 * 分类目录页面
 * 显示指定分类下的所有文章
 * 支持多级分类：/category 或 /category/subcategory
 */

import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { getAllPosts } from "@/lib/posts";

// 用于移除数字前缀的正则
const NUM_PREFIX_REGEX = /^\d+-/;

// 生成静态参数
export async function generateStaticParams() {
  const posts = await getAllPosts();

  // 收集所有分类路径
  const categoryPaths = new Set<string>();

  for (const post of posts) {
    // 添加分类路径
    categoryPaths.add(post.category);
  }

  return Array.from(categoryPaths).map((category) => ({
    category: [category],
  }));
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string[] }>;
}) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category.join("/"));

  return {
    title: `${categoryName.replace(NUM_PREFIX_REGEX, "")} - 我的博客`,
    description: `${categoryName.replace(NUM_PREFIX_REGEX, "")} 分类下的所有文章`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string[] }>;
}) {
  const { category } = await params;
  const categoryPath = category.join("/");
  const decodedCategory = decodeURIComponent(categoryPath);

  // 获取所有文章并过滤出该分类下的
  const allPosts = await getAllPosts();

  // 过滤出该分类下的文章
  // category 是完整路径如 "4-全栈/01-elysia"
  // 文章的 category 也是完整路径
  const posts = allPosts.filter((post) => post.category === decodedCategory);

  // 按日期排序
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 构建面包屑导航
  const breadcrumbs = category.map((cat, index) => ({
    name: decodeURIComponent(cat).replace(NUM_PREFIX_REGEX, ""),
    path: category.slice(0, index + 1).join("/"),
  }));

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* 面包屑导航 */}
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link
            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            href="/"
          >
            首页
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div className="flex items-center gap-2" key={crumb.path}>
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-900 dark:text-white">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  href={`/${crumb.path}`}
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* 页面标题 */}
        <section className="mb-12">
          <h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
            {breadcrumbs.at(-1)?.name}
          </h1>
          <p className="text-gray-600 text-lg dark:text-gray-400">
            共 {posts.length} 篇文章
          </p>
        </section>

        {/* 文章列表 */}
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
      </div>
    </div>
  );
}
