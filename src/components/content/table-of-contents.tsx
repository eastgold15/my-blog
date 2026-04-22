/**
 * 目录导航组件
 * 显示文章的目录结构，支持滚动高亮当前章节
 */

"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  /** 标题 */
  title?: string;
  /** 目录数据 */
  toc: TocItem[];
}

export function TableOfContents({ toc, title }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  // 监听滚动，高亮当前章节
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px", // 顶部 20% 到底部 60% 的范围内触发
        threshold: 0,
      }
    );

    // 观察所有标题元素
    const headings = document.querySelectorAll(
      "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"
    );
    for (const heading of headings) {
      observer.observe(heading);
    }

    return () => observer.disconnect();
  }, []);

  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {title && (
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      <ul className="space-y-1 text-sm">
        {toc.map((item) => (
          <TocItemNode
            activeId={activeId}
            depth={0}
            item={item}
            key={item.id}
          />
        ))}
      </ul>
    </nav>
  );
}

function TocItemNode({
  item,
  activeId,
  depth,
}: {
  item: TocItem;
  activeId: string;
  depth: number;
}) {
  const isActive = activeId === item.id;
  const paddingLeft = depth * 12; // 每级缩进 12px

  return (
    <li>
      <a
        className={`block truncate transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
          isActive
            ? "font-medium text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400"
        }`}
        href={`#${item.id}`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {item.title}
      </a>
      {item.children && item.children.length > 0 && (
        <ul className="mt-1 space-y-1">
          {item.children.map((child) => (
            <TocItemNode
              activeId={activeId}
              depth={depth + 1}
              item={child}
              key={child.id}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
