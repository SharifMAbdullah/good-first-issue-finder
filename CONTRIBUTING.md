# Contributing to Good First Issue Finder

Thanks for your interest in contributing! A project that helps people find good first issues should itself be welcoming to new contributors — so all experience levels are welcome here.

## Development Setup

### Prerequisites

- **Node.js >= 20**
- **GitHub Personal Access Token** (required) — the app cannot fetch issues without it
- **GitLab Private Token** (optional) — improves rate limits for GitLab instances

### Getting Started

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/good-first-issue-finder.git
cd good-first-issue-finder

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GITHUB_TOKEN

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/search` to see the app in action.

### `npm run dev` vs `npm run preview`

| Command           | Runtime                       | Use When                                                        |
| ----------------- | ----------------------------- | --------------------------------------------------------------- |
| `npm run dev`     | Standard Next.js dev server   | Most development work                                           |
| `npm run preview` | Cloudflare Workers simulation | Testing KV bindings, `/api/stats`, or Workers-specific behavior |

> **Note:** The `/api/stats` endpoint will return a 500 error when using `npm run dev` because it depends on a Cloudflare KV binding that only exists in the Workers runtime. This is expected — use `npm run preview` if you need to test that endpoint.

## Architecture Overview

### Unified Data Model

Both GitHub and GitLab issues are normalized into a single `UnifiedIssue` type (defined in `types/issues.ts`). The adapter pattern in `lib/adapters/issueAdapters.ts` handles the normalization. When adding a new data source, this is where the mapping logic goes.

### URL-as-State

All search and filter state lives in URL query parameters, managed by the `useLiveFilters` hook in `hooks/useLiveFilters.ts`. There is no global state store. A filter change pushes to the URL, which triggers a re-fetch in `useLiveIssues`. This makes every filter combination shareable via URL.

### Client-Only Bookmarks

The `useBookmarks` hook (`hooks/useBookmarks.ts`) uses React's `useSyncExternalStore` backed by `localStorage`. There is no server persistence for bookmarks. The hook reacts to both a custom `bookmarksUpdated` event (same-tab) and the native `storage` event (cross-tab sync).

## Easy First Contribution: Adding a GitLab Instance

One of the simplest ways to contribute is adding a new GitLab instance:

1. Open `lib/constants/gitLabInstances.ts`
2. Add a new entry to the `KNOWN_GITLAB_INSTANCES` array:
   ```ts
   { id: 'my-instance', name: 'My Instance', baseUrl: 'https://gitlab.example.org' }
   ```
   Use the optional `path` field for group-scoped queries (e.g., `path: 'my-org'`).
3. Test with `npm run dev` — select the GitLab platform filter on `/search`
4. Note: each instance has a 3.5-second timeout. Slow instances are silently skipped.

## Code Style

- **TypeScript strict mode** is enabled — all functions and interfaces should be explicitly typed
- **Component props** should use named interfaces (e.g., `FilterSidebarProps`, `ResultCardProps`), not inline types

Before submitting your PR, make sure to do the following:

- Run these commands:
```bash
npm run lintcheck # to check if your code is compatible with eslint
npm run lintfix # to fix eslint issues
npm run stylecheck # to check if your code style is compatible with prettier
npm run stylefix # to fix prettier issues
```

- Follow the existing patterns you see in the codebase

## Testing

Currently, test files exist in `__tests__/` but no test runner (Jest/Vitest) is configured in the project. The test files use Jest-style `describe`/`it`/`expect` syntax.

Setting up a test runner is itself a welcome contribution! Vitest would be a natural fit given the tech stack.

## Pull Request Process

1. **Branch naming:** `feat/your-feature`, `fix/what-you-fixed`, `docs/what-you-documented`
2. **Keep PRs focused** — one concern per PR
3. **Fill in the PR template** — it will auto-populate when you open a PR
4. **Visual changes** need before/after screenshots
5. PRs are merged with squash commits

## Reporting Issues

Before opening a new issue:

- Check existing [open issues](https://github.com/SharifMAbdullah/good-first-issue-finder/issues) and closed issues to avoid duplicates
- Use the provided issue templates for [bug reports](.github/ISSUE_TEMPLATE/bug_report.md) and [feature requests](.github/ISSUE_TEMPLATE/feature_request.md)

For larger changes or architectural proposals, open a discussion issue first before starting implementation.

## Questions?

Questions are valid contributions! If something is unclear about the codebase or setup process, open an issue — it probably means the documentation needs improvement.
