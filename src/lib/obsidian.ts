/**
 * Obsidian 语法处理工具
 *
 * wiki 链接 [[link]]、高亮 ==text==、标注 > [!NOTE]、嵌入 ![[file]]
 * 由 remark-obsidian 在 ReactMarkdown 中处理
 *
 * 这里只保留 remark-obsidian 不覆盖的语法：
 * - #标签 → 可点击标签链接
 * - ^blockid → HTML 锚点
 */

/**
 * 处理 Obsidian 标签 #标签
 * 转换为可点击的标签链接
 */
export function convertTags(content: string): string {
  // 将 #标签（在行尾或独立）转换为标签链接
  // 避免转换标题中的 #
  return content.replace(/(^|\s)#([^\s#]+)/gm, (_match, prefix, tag) => {
    // 排除已经是标题的情况
    if (prefix === "" && _match.startsWith("##")) {
      return _match;
    }
    return `${prefix}[#${tag}](/tags/${tag})`;
  });
}

/**
 * 处理 Obsidian 块引用 ^blockid
 * 转换为 HTML 锚点
 */
export function convertBlockReferences(content: string): string {
  // ^blockid -> <a id="block-blockid"></a>
  return content.replace(
    /\^([a-zA-Z0-9_-]+)$/gm,
    (_match, blockId) => `<a id="block-${blockId}" class="block-reference"></a>`
  );
}

/**
 * 综合处理 remark-obsidian 不覆盖的语法
 */
export function processObsidianSyntax(content: string): string {
  let processed = content;

  // 按顺序处理
  processed = convertBlockReferences(processed);
  processed = convertTags(processed);

  return processed;
}
