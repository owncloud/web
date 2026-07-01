# agents.md — web

## Repository Overview

ownCloud Web is the next-generation frontend for ownCloud Infinite Scale (oCIS), built as a single-page application with Vue.js and TypeScript. It provides file management, sharing, real-time collaboration and administration through a plugin-based architecture.

- **Classification:** oCIS
- **Activity Status:** Active
- **License:** AGPL-3.0
- **Language:** TypeScript, Vue.js

## Architecture & Key Paths

- `packages/` — Monorepo packages (core modules and built-in apps)
  - `packages/web-client/` — TypeScript client for oCIS Graph API
  - `packages/web-container/` — Static assets and base files
  - `packages/extension-sdk/` — SDK for custom extension development
  - `packages/web-pkg/` — Shared library code
  - `packages/web-runtime/` — Authentication, routing, theming, app handling
  - `packages/web-app-files/` — Core file management app
  - `packages/web-app-admin-settings/` — Admin UI for users, groups, spaces
  - `packages/web-app-activities/` — Activity stream app
  - `packages/web-app-pdf-viewer/` — PDF viewer app
  - `packages/web-app-preview/` — Audio/video/image previewer
  - `packages/web-app-text-editor/` — Plain text editor app
  - `packages/web-app-external/` — WOPI document editing integration
  - `packages/design-system/` — Shared UI component library
- `tests/` — Test suites (unit with Vitest, e2e with Playwright)
- `docs/` — Documentation source files
- `config/` — Configuration examples
- `docker/` — Docker-related files
- `deployments/` — Deployment configurations
- `Makefile` — Build orchestration
- `package.json` — Root package with scripts
- `pnpm-workspace.yaml` — pnpm monorepo workspace config
- `vite.config.ts` — Vite build configuration
- `vitest.config.ts` — Vitest test configuration
- `eslint.config.js` — ESLint configuration

## Development Conventions

- pnpm monorepo with workspace packages
- Vite for building, Vitest for unit tests, Playwright for e2e
- EditorConfig and Prettier for formatting
- Semantic versioning with releases every few weeks
- Changelog entries tracked in `changelog/` directory
- `.github/CONTRIBUTING.md` for contribution guidelines
- Issue/PR templates available

## Build & Test Commands

```bash
pnpm install                # Install all dependencies
pnpm build                  # Production build
pnpm build:w                # Build with watch mode
pnpm test:unit              # Run unit tests (Vitest)
pnpm test:e2e               # Run e2e tests (Playwright)
make clean                  # Clean build artifacts
make dist                   # Build distribution
make release                # Create release
make docs-generate          # Generate documentation
make docs-serve             # Serve documentation locally
```

## Important Constraints

- **AGPL-3.0 copyleft license:** This is a high-profile repository. The OSPO Apache 2.0 migration requires auditing all copyleft dependencies and contributor agreements before relicensing.
- **oCIS-only since v7.1.0:** Versions 7.1.0+ only support oCIS as a backend. OC10 support requires v7.0.2.
- **Extension architecture:** Third-party extensions use the extension-sdk package.
- **Docker image:** Published as `owncloud/web` on Docker Hub.
- **Accessibility goal:** The project explicitly aims for WCAG compliance.


## OSPO Policy Constraints

### GitHub Actions
- **Only** use actions owned by `owncloud`, created by GitHub (`actions/*`), verified on the GitHub Marketplace, or verified by the ownCloud Maintainers.
- Pin all actions to their full commit SHA (not tags): `uses: actions/checkout@<SHA> # vX.Y.Z`
- Never introduce actions from unverified third parties.

### Dependency Management
- Dependabot is configured for automated dependency updates.
- Review and merge Dependabot PRs as part of regular maintenance.
- Do not introduce new dependencies without discussion in an issue first.

### Git Workflow
- **Rebase policy**: Always rebase; never create merge commits. Use `git pull --rebase` and `git rebase` before pushing.
- **Signed commits**: All commits **must** be PGP/GPG signed (`git commit -S -s`).
- **DCO sign-off**: Every commit needs a `Signed-off-by` line (`git commit -s`).
- **Conventional Commits & Squash Merge**: Use the [Conventional Commits](https://www.conventionalcommits.org/) format where the repository enforces it. Many repos use squash merge, where the PR title becomes the commit message on the default branch — apply Conventional Commits format to PR titles as well. A reusable GitHub Actions workflow enforces this.

## Context for AI Agents

- This is a large TypeScript/Vue.js monorepo managed with pnpm workspaces.
- The `packages/` directory contains all core modules and built-in apps.
- Shared code lives in `packages/web-pkg/`; the runtime in `packages/web-runtime/`.
- Configuration is via `config.json` files that specify app loading and server settings.
- The extension system allows external apps to register file handlers, UI components and routes.
- Docker images are built from `docker/Dockerfile`.
- Test infrastructure: Vitest for unit tests, Playwright/Cucumber for e2e.
