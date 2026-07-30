/**
 * 文件树组件
 * 递归展示目录结构，用于左侧章节导航
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import type { TreeNode } from "@/lib/vault-cache";

interface FileTreeProps {
  /** 文章根目录（用于构造链接） */
  baseDir: string;
  /** 当前文件的路径（高亮用） */
  currentPath: string;
  /** 树的根节点列表 */
  nodes: TreeNode[];
}

export function FileTree({ nodes, currentPath, baseDir }: FileTreeProps) {
  return (
    <nav className="hide-scrollbar sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
        目录
      </h3>
      <ul>
        {nodes.map((node) => (
          <TreeNodeItem
            baseDir={baseDir}
            currentPath={currentPath}
            depth={0}
            key={node.path}
            node={node}
          />
        ))}
      </ul>
    </nav>
  );
}

function TreeNodeItem({
  node,
  currentPath,
  baseDir,
  depth,
}: {
  node: TreeNode;
  currentPath: string;
  baseDir: string;
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.type === "file") {
    const linkPath = `/${encodeURIComponent(node.path.replace(/\.md$/, ""))}`;
    const isActive = node.path === currentPath;

    return (
      <li>
        <Link
          className={`block truncate py-1 pr-2 text-sm transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
            isActive
              ? "font-medium text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
          href={linkPath}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          {node.name}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        className="flex w-full items-center gap-1 py-1 pr-2 text-left font-medium text-gray-700 text-sm transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
        onClick={() => setIsOpen(!isOpen)}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        type="button"
      >
        <svg
          aria-hidden="true"
          className={`h-3 w-3 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5l7 7-7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        {node.name}
      </button>
      {isOpen && node.children && (
        <ul>
          {node.children.map((child) => (
            <TreeNodeItem
              baseDir={baseDir}
              currentPath={currentPath}
              depth={depth + 1}
              key={child.path}
              node={child}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
