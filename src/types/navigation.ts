/**
 * 导航类型定义
 */

export interface NavItem {
  /** 子菜单项 */
  children?: NavItem[];
  /** 是否是博客目录 */
  isBlog?: boolean;
  /** 显示名称 */
  label: string;
  /** 文件路径（用于内部链接） */
  path?: string;
  /** URL 路径 */
  slug: string;
}

export interface NavStructure {
  /** 博客目录配置 */
  blogDir: string;
  /** 主导航项 */
  mainNav: NavItem[];
}
