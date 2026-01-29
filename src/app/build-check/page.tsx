/**
 * 构建诊断页面 - 用于检查生产环境数据获取
 */

import { fetchAllMarkdownFiles } from "@/lib/github";

export const dynamic = "force-static";

export default async function BuildDiagnosticPage() {
  let files: any[] = [];
  let error: string | null = null;
  let envInfo = {
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER,
    repo: process.env.NEXT_PUBLIC_GITHUB_REPO,
    branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH,
    hasToken: !!process.env.BLOG_GITHUB_TOKEN,
    isGitHubActions: process.env.GITHUB_ACTIONS === 'true',
  };

  try {
    files = await fetchAllMarkdownFiles();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">构建诊断信息</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">环境信息</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(envInfo, null, 2)}
        </pre>
      </section>

      {error && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-600">错误</h2>
          <p className="text-red-600">{error}</p>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">获取到的文件 ({files.length})</h2>
        {files.length === 0 ? (
          <p className="text-yellow-600">没有获取到任何文件！请检查：</p>
        ) : (
          <ul className="list-disc pl-6">
            {files.slice(0, 20).map((item: any) => (
              <li key={item.file.path}>
                {item.category} / {item.file.name}
              </li>
            ))}
            {files.length > 20 && (
              <li className="text-gray-500">... 还有 {files.length - 20} 个文件</li>
            )}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">检查清单</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className={envInfo.hasToken ? "text-green-600" : "text-red-600"}>
            {envInfo.hasToken ? "✅" : "❌"} GitHub Token 已配置
          </li>
          <li className={envInfo.owner ? "text-green-600" : "text-red-600"}>
            {envInfo.owner ? "✅" : "❌"} GitHub Owner 已配置
          </li>
          <li className={files.length > 0 ? "text-green-600" : "text-red-600"}>
            {files.length > 0 ? "✅" : "❌"} 成功获取到文件
          </li>
        </ul>
      </section>
    </div>
  );
}
