/**
 * Obsidian 语法处理工具
 * 转换 Obsidian 特殊语法为标准 Markdown
 */

/**
 * 处理 Obsidian Wiki 链接 [[链接]]
 * 转换为标准 Markdown 链接
 *
 * 支持的格式：
 * - [[文件名]] - 简单链接
 * - [[文件名 | 别名]] - 带别名的链接
 * - [[目录/文件名]] - 带目录的链接
 * - [[文件名#章节]] - 带章节锚点的链接
 */
export function convertWikiLinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_match, linkText) => {
    // 解析链接内容
    let target = linkText;
    let alias = "";

    // 检查是否有别名 [[目标 | 别名]]
    if (linkText.includes("|")) {
      const parts = linkText.split("|");
      target = parts[0].trim();
      alias = parts.slice(1).join("|").trim();
    }

    // 检查是否有章节锚点 [[目标#章节]]
    let anchor = "";
    if (target.includes("#")) {
      const parts = target.split("#");
      target = parts[0].trim();
      anchor = parts[1].trim();
    }

    // 生成 slug
    const slug = target
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-一 - 龥/]/g, "");

    // 生成显示文本
    const display = alias || target.split("/").pop() || target;

    // 生成链接路径
    const href = anchor ? `/posts/${slug}#${anchor}` : `/posts/${slug}`;

    return `[${display}](${href})`;
  });
}

/**
 * 处理 Obsidian 嵌入 ![[文件]]
 * 转换为注释或保留（因为静态导出无法动态嵌入）
 */
export function convertEmbeds(content: string): string {
  // ![[文件名]] -> <!-- 嵌入：文件名 -->
  return content.replace(
    /!\[\[([^\]]+)\]\]/g,
    (_match, fileName) => `<!-- 嵌入内容：${fileName} -->`
  );
}

/**
 * 处理 Obsidian 标签 #标签
 * 转换为可点击的标签链接
 */
export function convertTags(content: string): string {
  // 将 #标签（在行尾或独立）转换为标签链接
  // 避免转换标题中的 #
  return content.replace(/(^|\s)#([^\s#]+)/gm, (match, prefix, tag) => {
    // 排除已经是标题的情况
    if (prefix === "" && match.startsWith("##")) {
      return match;
    }
    return `${prefix}[#${tag}](/tags/${tag})`;
  });
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
 * 处理 Obsidian 调用 > 引用内容
 * 标准 Markdown blockquote 已支持
 */
export function convertCallouts(content: string): string {
  // 简单的 callout 处理
  // > [!NOTE] -> > **Note**
  return content.replace(
    /^> \[!(\w+)\](.*)$/gm,
    (_match, type, rest) => `> **${type.toUpperCase()}**${rest}`
  );
}

/**
 * 综合处理所有 Obsidian 语法
 */
export function processObsidianSyntax(content: string): string {
  let processed = content;

  // 按顺序处理各种语法
  processed = convertEmbeds(processed);
  processed = convertWikiLinks(processed);
  processed = convertBlockReferences(processed);
  processed = convertCallouts(processed);
  processed = convertHighlights(processed);
  processed = convertTags(processed);

  return processed;
}
