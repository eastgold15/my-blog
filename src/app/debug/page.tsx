/**
 * 调试页面 - 查看获取的文章数据
 */

import { fetchAllMarkdownFiles } from "@/lib/github";
import { getAllPosts } from "@/lib/posts";

export default async function DebugPage() {
  let files: Array<{ category: string; file: any }> = [];
  let posts: any[] = [];
  let error: string | null = null;

  try {
    files = await fetchAllMarkdownFiles();
  } catch (e: any) {
    error = `获取文件列表失败: ${e.message}`;
  }

  try {
    posts = await getAllPosts();
  } catch (e: any) {
    error = error || `获取文章失败: ${e.message}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">调试信息</h1>

      {error && (
        <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
          <p className="font-bold">错误:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            获取到的 Markdown 文件 ({files.length})
          </h2>
          {files.length === 0 ? (
            <p className="text-red-500">没有找到任何 Markdown 文件</p>
          ) : (
            <div className="space-y-2">
              {files.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm"
                >
                  <p><strong>分类:</strong> {item.category}</p>
                  <p><strong>文件名:</strong> {item.file.name}</p>
                  <p><strong>路径:</strong> {item.file.path}</p>
                  <p><strong>大小:</strong> {item.file.size} bytes</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            解析后的文章 ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <p className="text-yellow-500">没有成功解析任何文章</p>
          ) : (
            <div className="space-y-2">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="p-4 bg-green-100 dark:bg-green-900 rounded"
                >
                  <p><strong>标题:</strong> {post.title}</p>
                  <p><strong>Slug:</strong> {post.slug}</p>
                  <p><strong>分类:</strong> {post.category}</p>
                  <p><strong>日期:</strong> {post.date}</p>
                  <p><strong>草稿:</strong> {post.draft ? "是" : "否"}</p>
                  <p><strong>内容长度:</strong> {post.content?.length || 0} 字符</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">环境变量</h2>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded space-y-2 font-mono text-sm">
            <p><strong>Owner:</strong> {process.env.NEXT_PUBLIC_GITHUB_OWNER}</p>
            <p><strong>Repo:</strong> {process.env.NEXT_PUBLIC_GITHUB_REPO}</p>
            <p><strong>Branch:</strong> {process.env.NEXT_PUBLIC_GITHUB_BRANCH}</p>
            <p><strong>Has Token:</strong> {process.env.BLOG_GITHUB_TOKEN ? "是 (已设置)" : "否 (未设置)"}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">测试链接</h2>
          <div className="space-y-2">
            <a
              href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/tree/${process.env.NEXT_PUBLIC_GITHUB_BRANCH}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-blue-100 dark:bg-blue-900 rounded hover:underline"
            >
              查看 GitHub 仓库 →
            </a>
            <a
              href={`https://api.github.com/repos/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/git/trees/${process.env.NEXT_PUBLIC_GITHUB_BRANCH}?recursive=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-purple-100 dark:bg-purple-900 rounded hover:underline"
            >
              查看 GitHub API (Tree) →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
