# pori 博客

![Deploy to GitHub Pages](https://github.com/eastgold15/my-blog/actions/workflows/deploy.yml/badge.svg)

基于 Next.js 16 的静态博客，内容来自 Obsidian Vault，**构建期间零 API 调用**。

---

## 架构

```
Obsidian Vault (GitHub)
      │ git clone --depth 1
      ▼
  .vault-cache/ (本地磁盘缓存)
      │ 读取 + 筛选
      ▼
  posts.ts → vault-cache.ts
      │ 解析 frontmatter
      ▼
  blog 文章 / article 文章
      │ Next.js SSG
      ▼
  静态 HTML (out/)
      │ 部署
      ▼
  GitHub Pages
```

**核心设计：** 不直接在构建时请求 GitHub API，而是项目启动时一次性 clone vault 到本地 `.vault-cache/`，后续全部从本地读取。

---

## 三种页面模式

| 模式 | 触发条件 | 布局 |
|------|---------|------|
| **blog** | 文件在 `dirs.blog` 下 | 右侧目录 |
| **article（书视图）** | 文件在 `dirs.article` 子目录 | 左文件树 + 中内容 + 右 TOC |
| **分类列表** | URL 匹配 frontmatter `category` | 文章卡片网格 |

---

## 目录结构

```
my-blog/
├── .vault-cache/           ← Obsidian vault 本地缓存（自动 git clone）
├── src/
│   ├── app/                ← 页面
│   │   ├── page.tsx        ← 首页（blog 文章列表）
│   │   ├── layout.tsx      ← 全局布局
│   │   ├── [...category]/  ← 书视图 / 分类列表
│   │   └── posts/[slug]/   ← 文章详情页
│   │
│   ├── components/
│   │   ├── blog/           ← 文章卡片、元数据、上下篇导航
│   │   ├── content/        ← 代码块、TOC、文件树、复制按钮
│   │   └── layout/         ← Header、Footer
│   │
│   ├── lib/                ← 核心逻辑
│   │   ├── vault-cache.ts  ← git 同步 + 文件发现 + 目录树
│   │   ├── posts.ts        ← 文章数据获取
│   │   ├── mdx.ts          ← gray-matter + reading-time
│   │   ├── toc.ts          ← TOC 生成
│   │   ├── obsidian.ts     ← Obsidian 语法转换
│   │   └── navigation.ts   ← Tab 栏生成
│   │
│   ├── configs/
│   │   └── config.ts       ← 全局配置（博客、目录、Tab 栏、排除规则）
│   │
│   └── types/              ← TypeScript 类型
│
├── biome.jsonc             ← 代码格式化
└── next.config.ts          ← Next.js 配置（静态导出）
```

---

## Config 驱动一切

`src/configs/config.ts` 控制博客行为，无需改代码：

```ts
content: {
  dirs: {
    blog: ["0-blog"],               // blog 目录 → Tab "blog"
    article: ["4-全栈", "2-技术文章"], // 文章目录 → Tab "全栈"、"技术文章"
  },
  extraTabs: [
    { label: "GitHub", href: "https://github.com/eastgold15" },  // 外链 Tab
  ],
  exclude: {
    prefix: ["_", "."],             // 隐藏文件排除
    dirs: ["templates", "assets"],
    files: ["CLAUDE.md"],
  },
}
```

Tab 栏自动从 `dirs.blog` + `dirs.article` + `extraTabs` 生成，数字前缀自动去除（`0-blog` → `blog`，`4-全栈` → `全栈`）。

---

## 文章写作

每篇 `.md` 文件通过 YAML frontmatter 声明元数据：

```yaml
---
title: 文章标题
category: 全栈          # 分类（必填，无则默认"其他"）
date: 2024-01-15
tags: [typescript, react]
description: 文章摘要
draft: false           # 草稿不会发布
---
```

支持 Obsidian 语法：
- `[[wiki link]]` 自动转为文章链接
- `==高亮==` 转为 `<mark>`
- `> [!NOTE]` 转为标注

---

## 本地开发

```bash
bun dev            # 启动开发服务器
bun run build      # 构建静态导出
bun run start      # 预览静态导出
bun run typeCheck  # 类型检查
```

首次启动自动 clone vault 到 `.vault-cache/`，后续构建只需 `git fetch + reset`。

---

## 部署

推送到 GitHub 的 `main` 分支自动触发 GitHub Actions 构建并部署到 Pages。

需要配置的仓库 Secret：
- `BLOG_GITHUB_TOKEN` — 用于 clone 私有 vault 仓库的 token


1. 首先安装 obsidian：https://obsidian.md/
2. 创建一个obsidian vault，并设置git仓库
3. 安装obsidian git插件 
4. 创建1个github仓库，作为为obsidian的 vault 的 远程仓库
5. 填写环境变量文件