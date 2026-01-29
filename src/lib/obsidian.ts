/**
 * Obsidian 语法处理工具
 * 转换 Obsidian 特殊语法为标准 Markdown
 */

/**
 * 处理 Obsidian Wiki 链接 [[链接]]
 * 转换为标准 Markdown 链接
 */
export function convertWikiLinks(content: string): string {
  // [[文件名]] -> [文件名](/posts/file-name)
  return content.replace(
    /\[\[([^\]]+)\]\]/g,
    (match, linkText) => {
      const [text, alias] = linkText.split("|");
      const slug = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-一-龥]/g, "");
      const display = alias || text;
      return `[${display}](/posts/${slug})`;
    }
  );
}

/**
 * 处理 Obsidian 嵌入 ![[文件]]
 * 转换为注释或保留（因为静态导出无法动态嵌入）
 */
export function convertEmbeds(content: string): string {
  // ![[文件名]] -> <!-- 嵌入: 文件名 -->
  return content.replace(
    /!\[\[([^\]]+)\]\]/g,
    (match, fileName) => `<!-- 嵌入内容: ${fileName} -->`
  );
}

/**
 * 处理 Obsidian 标签 #标签
 * 转换为可点击的标签链接
 */
export function convertTags(content: string): string {
  // 将 #标签（在行尾或独立）转换为标签组件
  // 避免转换标题中的 #
  return content.replace(
    /(^|\s)#([^\s#]+)/gm,
    (match, prefix, tag) => {
      // 排除已经是标题的情况
      if (prefix === "" && match.startsWith("##")) {
        return match;
      }
      return `${prefix}[#${tag}](/tags/${tag})`;
    }
  );
}

/**
 * 处理 Obsidian 高亮 ==文本==
 * 转换为 Markdown 高亮语法
 */
export function convertHighlights(content: string): string {
  return content.replace(/==([^=]+)==/g, "<mark>$1</mark>");
}

/**
 * 处理 Obsidian 删除线 ~~文本~~
 * 标准 Markdown 已支持，无需转换
 */
export function convertStrikethrough(content: string): string {
  return content; // 标准 Markdown 已支持
}

/**
 * 综合处理所有 Obsidian 语法
 */
export function processObsidianSyntax(content: string): string {
  let processed = content;

  // 按顺序处理各种语法
  processed = convertEmbeds(processed);
  processed = convertWikiLinks(processed);
  processed = convertHighlights(processed);
  processed = convertTags(processed);

  return processed;
}
