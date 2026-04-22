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
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    const headings = document.querySelectorAll(
      "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"
    );
    for (const heading of headings) {
      observer.observe(heading);
    }

    return () => observer.disconnect();
  }, []);

  // 处理目录点击
  const handleItemClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // 更新 URL hash
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

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
            onItemClick={handleItemClick}
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
  onItemClick,
}: {
  item: TocItem;
  activeId: string;
  depth: number;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  const isActive = activeId === item.id;
  const paddingLeft = depth * 12;

  return (
    <li>
      <a
        className={`block truncate transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
          isActive
            ? "font-medium text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400"
        }`}
        href={`#${item.id}`}
        onClick={(e) => onItemClick(e, item.id)}
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
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
