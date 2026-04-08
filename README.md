# Good First Issue Finder

[![Live Site](https://img.shields.io/badge/Live-goodfirstissues.net-blue)](https://goodfirstissues.net)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A unified aggregator that surfaces **Good First Issues** from GitHub and GitLab into a single, searchable interface — so new contributors spend time coding, not searching.

**[Visit the live site](https://goodfirstissues.net)**

<!-- Add a screenshot of the search page here -->

## Features

- **Multi-platform aggregation** — GitHub Search API + 6 GitLab instances (gitlab.com, GNOME, Debian Salsa, KDE Invent, Freedesktop, Inkscape)
- **15 language filters** — JavaScript, TypeScript, Python, Java, Go, Rust, C++, C#, C, Ruby, PHP, Swift, Kotlin, Dart, Shell
- **6 sort modes** — Newest, Oldest, Recently Updated, Most Commented, Most Stars, Most Forks
- **Keyword search** — Full-text search with 300ms debounce across both platforms
- **Shareable URLs** — Every filter combination is encoded in the URL as query params
- **Bookmarks** — Save issues to revisit later, stored client-side (no account needed)
- **Visitor analytics** — Live visitor counter powered by Cloudflare KV

## Tech Stack

| Category   | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16 (App Router)                       |
| Runtime    | React 19                                      |
| Language   | TypeScript 5                                  |
| Styling    | Tailwind CSS v4                               |
| Animation  | Framer Motion                                 |
| Icons      | Lucide React                                  |
| Deployment | Cloudflare Workers via @opennextjs/cloudflare |
| Storage    | Cloudflare KV (visitor analytics)             |

## Getting Started

### Prerequisites

- Node.js >= 20
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (required)
- A [GitLab Private Token](https://gitlab.com/-/user_settings/personal_access_tokens) (required)

### Setup

```bash
git clone https://github.com/SharifMAbdullah/good-first-issue-finder.git
cd good-first-issue-finder
npm install
cp .env.example .env.local # To simulate cloudlflare, use .dev.vars
```

Edit `.env.local` and add your `GITHUB_TOKEN` and `GITLAB_TOKEN`(see [.env.example](.env.example) for details).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

> **Tip:** Use `npm run preview` instead to simulate the Cloudflare Workers runtime locally. This is needed to test the `/api/stats` endpoint which depends on a KV binding.

## Project Structure

```text
app/
  api/
    issues/route.ts           # Thin Controller (Routing only)
    stats/route.ts            # Visitor counter (Cloudflare KV)
    services/
      issueOrchestrator.ts    # Merging, sorting, formatting, enriching
      github/
        githubMappers.ts      # GitHub API fetching & enrichment
        githubClient.ts       # Normalization logic
      gitlab/
        gitlabbMappers.ts     # GitLab API fetching & timeout handling
        gitlabClient.ts       # Normalization logic

  search/page.tsx             # Search page with filters, sort, keyword search
  favorites/page.tsx          # Bookmarked issues (localStorage)
  page.tsx                    # Landing page
  layout.tsx                  # Root layout (fonts, metadata)
  globals.css                 # Global styles + custom scrollbar

components/
  search/
    FilterSidebar.tsx          # Platform & language filter panel
    ResultCard.tsx             # Issue result card
    SearchBar.tsx              # Keyword search input
    SortDropdown.tsx           # Sort order dropdown
  ui/
    header.tsx                 # Shared header with navigation
    bookmarkbutton.tsx         # Bookmark toggle button

hooks/
  useLiveFilters.ts            # URL-based filter state with debounce
  useLiveIssues.ts             # Fetches /api/issues when filters change
  useBookmarks.ts              # localStorage via useSyncExternalStore

lib/
  adapters/issueAdapters.ts    # Normalizes raw GitHub/GitLab responses → UnifiedIssue
  constants/
    gitLabInstances.ts         # The 6 monitored GitLab instances
    languages.ts               # 15 filterable languages
  utils/bookmarkStorage.ts     # localStorage CRUD for bookmarks

types/
  issues.ts                    # UnifiedIssue, Platform, SortOption, PaginatedResponse
  bookmark.ts                  # Bookmark types
```

## API Reference

### `GET /api/issues`

Fetches and merges issues from GitHub and GitLab.

| Param       | Type   | Default  | Description                                                         |
| ----------- | ------ | -------- | ------------------------------------------------------------------- |
| `platforms` | string | `github` | Comma-separated: `github`, `gitlab`                                 |
| `languages` | string | —        | Comma-separated language IDs (e.g., `typescript,python`)            |
| `q`         | string | —        | Keyword search query                                                |
| `sort`      | string | `newest` | One of: `newest`, `oldest`, `updated`, `comments`, `stars`, `forks` |
| `page`      | number | `1`      | Pagination page number                                              |

**Response:**

```json
{
  "issues": [UnifiedIssue],
  "nextPage": 2,
  "totalCount": 20
}
```

> Sorting by `stars` or `forks` triggers additional GitHub Repos API calls to fetch repository metadata.

### `GET /api/stats`

Returns visitor analytics. Requires the `VISITOR_COUNT` Cloudflare KV binding.

```json
{
  "allTime": 12345,
  "today": 42
}
```

> This endpoint returns 500 in `npm run dev` mode. Use `npm run preview` to test it locally.

## Environment Variables

See [.env.example](.env.example) for the full list with setup instructions.

| Variable       | Required | Description                                   |
| -------------- | -------- | --------------------------------------------- |
| `GITHUB_TOKEN` | Yes      | GitHub Personal Access Token for API access   |
| `GITLAB_TOKEN` | No       | GitLab Private Token for improved rate limits |

## Deployment

The app deploys to **Cloudflare Workers** via [@opennextjs/cloudflare](https://github.com/opennextjs/cloudflare).

```bash
npm run deploy    # Build and deploy to Cloudflare
npm run preview   # Build and preview locally in Workers runtime
```

### Required Cloudflare Resources

- **KV Namespace:** `VISITOR_COUNT` — for visitor analytics
- **Secret:** `GITHUB_TOKEN` — set via `wrangler secret put GITHUB_TOKEN`

### Available Scripts

| Script               | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Next.js dev server                                   |
| `npm run build`      | Production build                                     |
| `npm run start`      | Start production server                              |
| `npm run lintcheck`  | Check if your code is compatible with eslint         |
| `npm run lintfix`    | Fix eslint issues                                    |
| `npm run stylecheck` | Check if your code style is compatible with prettier |
| `npm run stylefix`   | Fix prettier issues                                  |
| `npm run preview`    | Cloudflare Workers local preview                     |
| `npm run deploy`     | Build and deploy to Cloudflare                       |
| `npm run cf-typegen` | Regenerate Cloudflare type bindings                  |

## Contributing

Contributions are welcome! Please read the [Contributing Guide](./CONTRIBUTING.md) for setup instructions, architecture overview, and PR process.

Looking for ideas? Check out the [open issues](https://github.com/SharifMAbdullah/good-first-issue-finder/issues).

## License

MIT — see [LICENSE](./LICENSE)
