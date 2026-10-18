<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Architecture (DDD + Onion, Nx Modular Monolith)

- `apps/` holds only thin executable shells (bootstrap, routing, providers, DI). All business logic and implementations live in `libs/`.
- Directory layout is fixed: `libs/<context>/{domain,application,infrastructure-client,infrastructure-server}`, `libs/<context>-ui/<feature>`, `libs/platform/<module>`, `libs/shared/kernel`. Do not change it without asking.
- Domain and application are framework-free TypeScript (no React, Redux, Keycloak, Axios, NestJS). Infrastructure implements ports from inner layers; inner layers never import infrastructure.
- Redux Toolkit is state/integration only, never the home of business logic. Keycloak only via adapters behind abstract auth/permission interfaces.
- Foodfolio is household inventory management (like Grocy), NOT a recipe system. Analyze legacy code in `C:\Users\thoma\Documents\Coding\Stream\CLEANUP\OLD\azkaban-v3` before designing new domain models; it is a reference, not an architecture template.

## Naming

- npm scope `@toxictoast`. Package name = Nx project name = import path.
- Flat, context-prefixed names: `libs/foodfolio/domain` → `@toxictoast/foodfolio-domain`, `libs/foodfolio-ui/stock-entry` → `@toxictoast/foodfolio-ui-stock-entry`, `libs/platform/http` → `@toxictoast/platform-http`.
- Every lib exposes only `src/index.ts` via `package.json#exports`; no deep imports.

## Tags (enforced in root `eslint.config.mjs` by `@nx/enforce-module-boundaries`)

Every project gets one tag per dimension, set in its `package.json` under `nx.tags`:

| Dimension | Values |
|-----------|--------|
| `scope:`   | `foodfolio`, `blog`, `platform`, `shared`, `app` |
| `type:`    | `domain`, `application`, `infrastructure`, `feature`, `ui`, `contracts`, `kernel`, `app`, `e2e` |
| `runtime:` | `browser`, `server`, `universal` |

- Contexts may only use their own scope plus `platform` and `shared`. A new bounded context needs its own `scope:` constraint in `eslint.config.mjs`.
- `type:feature` (React feature under `<context>-ui/`) must not import other features; shared UI goes into a `type:ui` lib.
- `type:domain`, `type:application`, `type:contracts`, `type:kernel` allow no external npm imports at all.
- `type:app` must not import `type:domain` directly; shells go through application/feature APIs.
