/**
 * 博客头部导航组件
 */

import Link from "next/link";

export function Header() {
  const navItems = [
    { href: "/", label: "首页" },
    { href: "/posts", label: "文章" },
    { href: "/software", label: "软件推荐" },
    {
      href: "https://github.com/SCUJJ-OSIG/knowledge_base",
      label: "Obsidian库",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-gray-200 border-b bg-white bg-opacity-90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900 dark:bg-opacity-90">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link className="flex items-center space-x-2" href="/">
            <span className="font-bold text-gray-900 text-xl dark:text-white">
              我的博客
            </span>
          </Link>

          <nav className="flex space-x-6">
            {navItems.map((item) => (
              <Link
                className="font-medium text-gray-700 text-sm transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
