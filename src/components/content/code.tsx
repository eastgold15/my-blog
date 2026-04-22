/**
 * 自定义 Code 组件
 * 为代码块添加复制按钮
 */

"use client";

import { CopyButton } from "./copy-button";

interface CodeProps {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
}

export function Code({ children, className, inline }: CodeProps) {
  // 如果是行内代码，不显示复制按钮
  if (inline) {
    return <code className={className}>{children}</code>;
  }

  // 提取代码文本
  const codeText = String(children || "");

  return (
    <div className="group relative">
      <CopyButton code={codeText} />
      <pre className="overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
