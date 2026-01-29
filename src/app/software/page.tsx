/**
 * 软件推荐页面
 * 展示常用软件和工具
 */

import { SoftwareCard } from "@/components/software/SoftwareCard";
import type { SoftwareItem, SoftwareCategory } from "@/types/software";
import Link from "next/link";

// 示例软件数据 - 你可以根据需要修改或从其他来源获取
const softwareList: SoftwareItem[] = [
  {
    name: "Visual Studio Code",
    icon: "https://code.visualstudio.com/favicon.ico",
    url: "https://code.visualstudio.com/",
    description: "微软开发的免费开源代码编辑器，支持多种编程语言和扩展。",
    category: "开发工具",
    openSource: true,
    free: true,
    rating: 5,
  },
  {
    name: "Obsidian",
    icon: "https://obsidian.md/favicon.ico",
    url: "https://obsidian.md/",
    description: "强大的知识管理工具，支持 Markdown、双向链接和丰富的插件生态。",
    category: "生产力",
    openSource: false,
    free: true,
    rating: 5,
  },
  {
    name: "Figma",
    icon: "https://www.figma.com/favicon.ico",
    url: "https://www.figma.com/",
    description: "基于云的设计工具，支持实时协作，UI/UX 设计的首选工具。",
    category: "设计",
    openSource: false,
    free: true,
    rating: 5,
  },
  {
    name: "Docker",
    icon: "https://www.docker.com/favicon.ico",
    url: "https://www.docker.com/",
    description: "容器化平台，让应用开发、部署和运行更加简单高效。",
    category: "开发工具",
    openSource: true,
    free: true,
    rating: 5,
  },
  {
    name: "Notion",
    icon: "https://www.notion.so/favicon.ico",
    url: "https://www.notion.so/",
    description: "一体化的工作空间，支持笔记、数据库、项目管理等功能。",
    category: "生产力",
    openSource: false,
    free: false,
    rating: 4,
  },
  {
    name: "Postman",
    icon: "https://www.postman.com/favicon.ico",
    url: "https://www.postman.com/",
    description: "API 开发和测试工具，支持 REST、GraphQL 等多种 API 协议。",
    category: "开发工具",
    openSource: false,
    free: true,
    rating: 4,
  },
];

const categories: SoftwareCategory[] = [
  "开发工具",
  "生产力",
  "设计",
  "系统工具",
  "通讯",
  "媒体",
  "游戏",
  "其他",
];

export default function SoftwarePage() {
  // 按分类组织软件
  const softwareByCategory = categories.reduce((acc, category) => {
    const items = softwareList.filter((s) => s.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<SoftwareCategory, SoftwareItem[]>);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 页面头部 */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            返回首页
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          软件推荐
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          这里是我日常使用的软件和工具推荐，希望能对你有所帮助。
        </p>
      </section>

      {/* 分类快速导航 */}
      <nav className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          分类导航
        </h2>
        <div className="flex flex-wrap gap-3">
          {Object.keys(softwareByCategory).map((category) => (
            <a
              key={category}
              href={`#${category}`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {category} ({softwareByCategory[category as SoftwareCategory].length})
            </a>
          ))}
        </div>
      </nav>

      {/* 软件列表 */}
      {Object.entries(softwareByCategory).map(([category, items]) => (
        <section key={category} id={category} className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            {category}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((software) => (
              <SoftwareCard key={software.name} software={software} />
            ))}
          </div>
        </section>
      ))}

      {/* 空状态 */}
      {softwareList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            暂无软件推荐，敬请期待...
          </p>
        </div>
      )}
    </div>
  );
}
