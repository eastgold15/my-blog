/**
 * 博客首页
 * 数据驱动:可筛维度从 views.published.base 读
 * 筛选交互:URL query,无 JS 也能用
 */

import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { getAllPublishedPosts, getDimensions } from "@/lib/views";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const allPosts = getAllPublishedPosts();
  const dimensions = await getDimensions();

  // 解析 URL 中的筛选条件(支持多值,用 `,` 分隔)
  const activeFilters: Record<string, string[]> = {};
  for (const dim of dimensions) {
    const raw = searchParams[dim.name];
    if (raw == null) continue;
    const values = (Array.isArray(raw) ? raw.join(",") : raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (values.length > 0) activeFilters[dim.name] = values;
  }

  // 应用筛选(同维度内 OR,跨维度 AND)
  const filteredPosts = allPosts.filter((post) => {
    for (const [key, values] of Object.entries(activeFilters)) {
      const field = post.data[key];
      const fieldValues = Array.isArray(field)
        ? field.map(String)
        : field == null
          ? []
          : [String(field)];
      if (!fieldValues.some((v) => values.includes(v))) {
        return false;
      }
    }
    return true;
  });

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

        {/* chip 筛选栏(从 base 动态生成) */}
        <section className="mb-12">
          {dimensions.map((dim) => {
            const active = activeFilters[dim.name] ?? [];
            return (
              <div className="mb-4" key={dim.name}>
                <h3 className="mb-2 font-medium text-gray-700 text-sm dark:text-gray-300">
                  {dim.displayName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dim.values.map((value) => {
                    const isActive = active.includes(value);
                    // 计算新 URL:同维度切换 OR,跨维度合并
                    const newValues = isActive
                      ? active.filter((v) => v !== value)
                      : [...active, value];
                    const params = new URLSearchParams();
                    // 1. 先处理当前维度(关键:即使 activeFilters 里没这条,也要加)
                    if (newValues.length > 0) {
                      params.set(dim.name, newValues.join(","));
                    }
                    // 2. 再合并其他维度的已有筛选
                    for (const [k, vs] of Object.entries(activeFilters)) {
                      if (k === dim.name) continue; // 上面已处理
                      if (vs.length > 0) {
                        params.set(k, vs.join(","));
                      }
                    }
                    const href = params.toString()
                      ? `/?${params.toString()}`
                      : "/";
                    return (
                      <Link
                        className={`rounded-full px-3 py-1 text-sm transition-colors ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                        href={href}
                        key={value}
                      >
                        {value}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {Object.keys(activeFilters).length > 0 && (
            <Link
              className="text-blue-500 text-sm hover:underline"
              href="/"
            >
              清除全部筛选
            </Link>
          )}
        </section>

        {/* 文章列表 */}
        <section>
          <h2 className="mb-6 font-semibold text-2xl text-gray-900 dark:text-white">
            文章 ({filteredPosts.length}/{allPosts.length})
          </h2>
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {allPosts.length === 0 ? "暂无文章" : "没有匹配的文章"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
