# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start Next.js dev server
bun run build    # Build for production (static export to out/)
bun run lint     # Biome check
bun run format   # Biome format --write
bun run check    # Ultracite check
bun run fix      # Ultracite fix
bun run start    # Serve the static export locally
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 6
- **Package Manager**: Bun
- **Styling**: Tailwind CSS v4
- **Formatter/Linter**: Biome + Ultracite
- **Deployment**: GitHub Pages (static export) + Vercel

## Project Architecture

### Data Flow

Markdown files are stored in a **separate GitHub repository** (the Obsidian vault). This blog fetches them at build time via the GitHub API and statically exports everything.

```
GitHub Repo (knowledge_base/0-blog/)
  └── GitHub Tree API (single request) ──→ fetchAllMarkdownFiles()
                                              ├── processObsidianSyntax()
                                              ├── parseBlogPost() → BlogPost[]
                                              └── generateSlug()
```

### Route Structure

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage with category nav + post grid |
| `/[...category]` | `src/app/[...category]/page.tsx` | Category listing (breadcrumb nav) |
| `/posts/[slug]` | `src/app/posts/[slug]/page.tsx` | Post detail (markdown→ReactMarkdown, TOC sidebar) |

### Key Modules

- **`src/lib/github.ts`** — GitHub API integration: fetches repo tree, file contents, builds navigation tree from directory structure
- **`src/lib/api.ts`** — Wrapped `ghFetch` with token injection, error handling, Next.js cache config
- **`src/lib/posts.ts`** — Post retrieval: `getAllPosts()`, `getPostBySlug()`, `getAllCategories()`, `getPostNavigation()` — iterates markdown files from GitHub and parses them
- **`src/lib/mdx.ts`** — Frontmatter parsing, excerpt generation, reading time calculation, slug generation (category-prefixed to avoid collisions)
- **`src/lib/obsidian.ts`** — Converts Obsidian-specific syntax (wiki links `[[]]`, embeds `![[]]`, tags, highlights `==text==`, callouts `[!NOTE]`) to standard Markdown
- **`src/lib/toc.ts`** — Generates table of contents from markdown headings using `github-slugger`
- **`src/lib/rehype-slug-custom.ts`** — Custom rehype plugin adding heading IDs (consistent with TOC generation)
- **`src/lib/navigation.ts`** — Cached wrapper around GitHub's directory-based navigation tree

### Component Structure

```
src/components/
├── blog/
│   ├── post-card.tsx       # Post grid card
│   ├── post-meta.tsx       # Date, tags, reading time
│   └── post-navigation.tsx # Previous/Next post
├── content/
│   ├── code.tsx            # Syntax highlighted code block (with copy button)
│   ├── copy-button.tsx     # Copy-to-clipboard for code blocks
│   └── table-of-contents.tsx # Sticky TOC sidebar with scroll spy
├── layout/
│   ├── header.tsx          # Client nav with dropdown menus
│   ├── header-wrapper.tsx  # Server wrapper fetching nav data
│   └── footer.tsx
└── mdx-components.tsx      # MDX component overrides
```

### Configuration

- **`src/configs/config.ts`** — Central config: GitHub repo owner/name/branch, file ignore patterns (glob), blog metadata
- **`.env.example`** — Required env vars: `BLOG_GITHUB_TOKEN`, `NEXT_PUBLIC_GITHUB_OWNER`, `NEXT_PUBLIC_GITHUB_REPO`, `NEXT_PUBLIC_GITHUB_BRANCH`

### Build / Deployment

- **Static Export**: `next.config.ts` outputs `export` mode (unless Vercel or dev). GitHub Pages receives pre-rendered HTML in `out/`.
- **GitHub Actions**: `.github/workflows/deploy.yml` — on push to `main`, installs deps with Bun, builds, deploys to Pages.
- **Vercel**: `vercel.json` — uses `bun run build` with `out/` as output directory.
- `basePath` is set to `/my-blog` only on GitHub Actions (non-Vercel) builds.

### File Filtering

`src/configs/config.ts` defines ignore patterns (glob) that skip files starting with `_`, `templates/`, `drafts/`, `*.template.md`, `.base` files, and `CLAUDE.md` during post fetching.

### Obsidian Vault Workflow

1. Obsidian vault is a separate git repo
2. Blog fetches from that repo's GitHub API at build time
3. Obsidian-specific syntax (`[[]]`, `![[}]]`, `==highlight==`, `[!NOTE]`) is converted in `src/lib/obsidian.ts`
4. Wiki links `[[file]]` are resolved to `/posts/category-file-slug` URLs
