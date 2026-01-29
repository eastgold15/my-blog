/**
 * 软件卡片组件
 * 展示软件图标、名称、描述和链接
 */

import type { SoftwareItem } from "@/types/software";

export function SoftwareCard({ software }: { software: SoftwareItem }) {
  return (
    <a
      href={software.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
    >
      {/* 软件图标 */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {software.icon ? (
          <img
            src={software.icon}
            alt={software.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">📦</span>
        )}
      </div>

      {/* 软件信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {software.name}
          </h3>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {software.openSource !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  software.openSource
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {software.openSource ? "开源" : "闭源"}
              </span>
            )}
            {software.free !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  software.free
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                }`}
              >
                {software.free ? "免费" : "付费"}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {software.description}
        </p>

        {software.category && (
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {software.category}
          </span>
        )}

        {software.rating && (
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < software.rating!
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 dark:text-gray-600"
                }`}
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
