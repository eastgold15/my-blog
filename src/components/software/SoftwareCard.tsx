/**
 * 软件卡片组件
 * 展示软件图标、名称、描述和链接
 */

import type { SoftwareItem } from "@/types/software";

export function SoftwareCard({ software }: { software: SoftwareItem }) {
  return (
    <a
      className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
      href={software.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* 软件图标 */}
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
        {software.icon ? (
          <img
            alt={software.name}
            className="h-full w-full object-cover"
            src={software.icon}
          />
        ) : (
          <span className="text-2xl">📦</span>
        )}
      </div>

      {/* 软件信息 */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {software.name}
          </h3>

          <div className="flex flex-shrink-0 items-center gap-1.5">
            {software.openSource !== undefined && (
              <span
                className={`rounded px-1.5 py-0.5 text-xs ${
                  software.openSource
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {software.openSource ? "开源" : "闭源"}
              </span>
            )}
            {software.free !== undefined && (
              <span
                className={`rounded px-1.5 py-0.5 text-xs ${
                  software.free
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                }`}
              >
                {software.free ? "免费" : "付费"}
              </span>
            )}
          </div>
        </div>

        <p className="mb-2 line-clamp-2 text-gray-600 text-sm dark:text-gray-400">
          {software.description}
        </p>

        {software.category && (
          <span className="text-gray-500 text-xs dark:text-gray-500">
            {software.category}
          </span>
        )}

        {software.rating && (
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                className={`h-4 w-4 ${
                  i < software.rating!
                    ? "fill-current text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
                key={i}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
