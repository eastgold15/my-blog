# my-blog

> 数据驱动的 Obsidian vault 博客。改 `views.published.base` 一行,网站可筛维度/列就变。

## 数据流

```
Obsidian vault (H:\main\knowledge_base, GitHub: SCUJJ-OSIG/knowledge_base)
  ↓ git push
GitHub remote
  ↓ Octokit codeload zip (build/dev 拉取)
.vault-cache/ (本地缓存,425+ 文件)
  ↓ gray-matter 解析 frontmatter
views.published.base 驱动 chip 栏 + 卡片墙
  ↓ Next.js 静态构建
GitHub Pages
```

## 核心机制:base 文件驱动

`views.published.base` 决定网站行为:

```yaml
properties:  # → chip 栏每一行
  形态: { displayName: 形态 }
  场景: { displayName: 场景 }
  tags: { displayName: tags }

views:  # → Obsidian Bases 里的视图
  - type: table
    name: 全部已发布
    filters: 'published == true'  # 只发布 published: true 的笔记
```

**加新列 = 改 `properties` 一行 → 刷新网页 → 看到新 chip 栏。**

**发布笔记 = 在 frontmatter 加 `published: true` → 重新构建 → 出现在网站。**

**系列文章 = 在 frontmatter 加 `series: 教程名` → 详情页带左侧章节目录。**

## 启动方式

### 开发模式

```bash
cd apps/blog
bun install
cp .env.example .env.local  # 填 BLOG_GITHUB_TOKEN
bun x next dev
```

dev 启动时会:
1. 检查 `.vault-cache/views.published.base` 是否存在
2. 不存在 → 调 `Octokit.downloadZipballArchive` 拉 vault(8 秒)
3. 存在 → 跳过,直接读

**注意**:dev 看到的 vault 是 GitHub 上的版本,本地修改后需要 `git push` 才生效。

### 生产构建

```bash
cd apps/blog
bun run build
npx serve@latest out
```

构建同样会拉 vault。

## 目录结构

```
my-blog/
├── apps/blog/          # Next.js 16 应用
│   ├── src/
│   │   ├── app/        # 路由
│   │   ├── components/ # UI 组件
│   │   ├── configs/    # vault 路径 + token 配置
│   │   └── lib/        # 数据流(vault-cache, base-parser, views)
│   └── package.json
├── packages/
│   ├── base-ast/       # .base 文件解析(obsdx)
│   └── base-engine/    # base filter 求值(暂未使用)
└── package.json        # monorepo 根
```

## 环境变量

`.env.local`(git ignored):

```
BLOG_GITHUB_TOKEN=ghp_xxx   # GitHub PAT,有 repo 读权限即可
NEXT_PUBLIC_GITHUB_BRANCH=main
NEXT_PUBLIC_GITHUB_OWNER=SCUJJ-OSIG
NEXT_PUBLIC_GITHUB_REPO=knowledge_base
```

## frontmatter 约定

```yaml
---
published: true              # 必须:决定是否进网站
形态: 参考型 | 教程型       # 可选:分类维度
场景: 部署 | 网络 | ...     # 可选:应用场景
series: 教程名               # 可选:存在=系列文章,详情页有章节目录
tags: [用/工具, 场景/网络]  # 可选:自由 tag
title: "显示标题"            # 可选:默认用文件名
excerpt: "一句话摘要"        # 可选:首页卡片显示
---
```

## 部署

`.github/workflows/` 已有 `auto-build.yml` + `deploy.yml`:
- `trigger-blog.yml`(在 vault 仓库):vault push 后触发
- `auto-build.yml`(在 my-blog):每日 0 点兜底构建
- `deploy.yml`(在 my-blog):blog 端 push 触发部署到 GitHub Pages
