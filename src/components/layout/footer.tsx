/**
 * 博客页脚组件
 */

import { config } from "@/configs/config";

export function Footer() {
  return (
    <footer className="mt-auto border-gray-200 border-t bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <p className="text-gray-600 text-sm dark:text-gray-400">
            © {new Date().getFullYear()} {config.blog.title}. 保留所有权利.
          </p>
          <div className="flex space-x-6">
            <a
              className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              href="https://github.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
