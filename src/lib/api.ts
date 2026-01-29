import { config } from "@/configs/config";

// 统一的错误处理与日志输出，符合你对全栈工具的调试需求
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API Error] ${response.status}: ${errorText}`);
    throw new Error(`请求失败: ${response.status}`);
  }

  // 针对 GitHub API 的 raw 模式，非 JSON 时直接返回文本
  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    return (await response.text()) as unknown as T;
  }

  return response.json();
}

/**
 * 核心封装：支持自动注入 Token 和 Next.js 缓存
 */
export const ghFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  // biome-ignore lint/performance/useTopLevelRegex: <explanation>
  const baseUrl = config.github.apiBaseUrl.replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const url = `${baseUrl}${cleanEndpoint}`;

  const defaultHeaders: HeadersInit = {
    // 优先使用环境变量中的 Token，保证私有仓库读取权限
    Authorization: config.github.githubToken ? `token ${config.github.githubToken}` : "",
    Accept: "application/vnd.github.v3+json",
  };

  const finalOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // 默认开启 Next.js 静态导出所需的增量验证或缓存
    next: {
      revalidate: options.next?.revalidate ?? 3600,
      tags: options.next?.tags
    },
  };

  const response = await fetch(url, finalOptions);
  return handleResponse<T>(response);
};