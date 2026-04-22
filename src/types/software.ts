/**
 * 软件分享类型定义
 */

export interface SoftwareItem {
  /** 软件分类 */
  category?: SoftwareCategory;
  /** 软件描述 */
  description: string;
  /** 是否免费 */
  free?: boolean;
  /** 软件图标 URL */
  icon: string;
  /** 软件名称 */
  name: string;
  /** 是否开源 */
  openSource?: boolean;
  /** 评分 (1-5) */
  rating?: number;
  /** 官网链接 */
  url: string;
}

export type SoftwareCategory =
  | "开发工具"
  | "生产力"
  | "设计"
  | "系统工具"
  | "通讯"
  | "媒体"
  | "游戏"
  | "其他";

export interface SoftwareCardProps {
  software: SoftwareItem;
}
