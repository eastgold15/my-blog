/**
 * 博客头部导航组件
 * 支持动态导航和二级下拉菜单
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavItem } from "@/types/navigation";

interface HeaderProps {
  navItems: NavItem[];
}

export function Header({ navItems }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-gray-200 border-b bg-white bg-opacity-90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900 dark:bg-opacity-90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link className="flex items-center space-x-2" href="/">
            <span className="font-bold text-gray-900 text-xl dark:text-white">
              我的博客
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
            <NavLink href="/">首页</NavLink>
            {navItems.map((item) => (
              <NavItem item={item} key={item.slug} />
            ))}
            <NavLink href="/software">软件推荐</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      className={`font-medium text-gray-700 text-sm transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 ${
        isActive ? "text-blue-600 dark:text-blue-400" : ""
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

function NavItem({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 如果没有子菜单，直接渲染链接
  if (!item.children || item.children.length === 0) {
    const isActive =
      pathname === item.slug || pathname?.startsWith(item.slug + "/");
    return (
      <Link
        className={`font-medium text-gray-700 text-sm transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 ${
          isActive ? "text-blue-600 dark:text-blue-400" : ""
        }`}
        href={item.slug}
      >
        {item.label}
      </Link>
    );
  }

  // 有子菜单，渲染下拉菜单
  const hasActiveChild = item.children.some(
    (child) => pathname === child.slug || pathname?.startsWith(child.slug + "/")
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center gap-1 font-medium text-gray-700 text-sm transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 ${
          hasActiveChild ? "text-blue-600 dark:text-blue-400" : ""
        }`}
      >
        {item.label}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 9l-7 7-7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {item.children.map((child) => {
            const isChildActive =
              pathname === child.slug || pathname?.startsWith(child.slug + "/");
            return (
              <Link
                className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isChildActive
                    ? "bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
                href={child.slug}
                key={child.slug}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
