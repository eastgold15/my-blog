"use client";

/**
 * 三栏布局的侧栏组件(掘金风 · 透明版)
 *
 * 设计:
 * - 侧栏本身**无背景、无边框**,像浮在主内容两侧
 * - 默认收起成 48px 宽窄竖条,只露一个透明圆形按钮(hover 才显底色)
 * - 展开时侧栏在屏幕内 sticky 跟随滚动,内容自然流动
 *   - 内容不超长时:目录全展开,不出现内部滚动条
 *   - 内容超长时:用 max-h 限制 + 内部滚动
 * - 状态写 localStorage(按 storageKey 区分),刷新后保留
 */

import { type ReactNode, useEffect, useState } from "react";

const STORAGE_PREFIX = "blog-sidebar:";
const EXPANDED_W = "w-60"; // 240px
const COLLAPSED_W = "w-12"; // 48px

function readStored(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (v === "open") return true;
    if (v === "closed") return false;
  } catch {
    // localStorage 可能被禁用(隐私模式),忽略
  }
  return fallback;
}

function writeStored(key: string, open: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, open ? "open" : "closed");
  } catch {
    // 忽略
  }
}

export function CollapsibleSidebar({
  side,
  storageKey,
  icon,
  collapsedIcon,
  title,
  children,
}: {
  /** 视觉位置,只决定按钮靠左/靠右 */
  side: "left" | "right";
  /** localStorage 用的 key(传 'chapter' / 'toc' 之类) */
  storageKey: string;
  /** 展开时显示的图标(放在标题旁) */
  icon?: ReactNode;
  /** 收起时在圆形按钮里显示的图标 */
  collapsedIcon?: ReactNode;
  /** 展开时的标题 */
  title: string;
  children: ReactNode;
}) {
  // SSR/首次客户端渲染用 false(收起),避免 hydration mismatch
  const [open, setOpen] = useState(false);

  // 客户端挂载后读 localStorage 修正
  useEffect(() => {
    setOpen(readStored(storageKey, false));
  }, [storageKey]);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      writeStored(storageKey, next);
      return next;
    });
  };

  return (
    <aside
      className={`sticky top-20 hidden shrink-0 self-start transition-[width] duration-200 ease-in-out md:block ${
        open ? EXPANDED_W : COLLAPSED_W
      }`}
    >
      <div className="flex h-full flex-col">
        {/* 顶部:展开态显示标题 + 收起按钮;收起态显示居中圆形按钮 */}
        {open ? (
          <div
            className={`mb-3 flex items-center gap-2 px-1 ${
              side === "right" ? "flex-row-reverse" : ""
            }`}
          >
            <button
              aria-label="收起侧栏"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={toggle}
              type="button"
            >
              {side === "right" ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
            <div
              className={`flex min-w-0 flex-1 items-center gap-2 font-medium text-gray-700 text-sm dark:text-gray-200 ${
                side === "right" ? "flex-row-reverse text-right" : ""
              }`}
            >
              {icon}
              <span className="truncate">{title}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex justify-center">
            <button
              aria-label="展开侧栏"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-300"
              onClick={toggle}
              title={title}
              type="button"
            >
              {collapsedIcon ?? icon}
            </button>
          </div>
        )}

        {/* 主体:展开态显示,收起态隐藏(用 grid-rows 动画) */}
        <div
          className={`grid transition-all duration-200 ease-in-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 py-1 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ChevronLeft({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M15 19l-7-7 7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
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
  );
}
