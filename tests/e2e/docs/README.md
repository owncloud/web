# Documentation screenshot capture

A small Playwright tool that automatically captures **end-user documentation screenshots** from a
live ownCloud Web instance, so the screenshots in the user documentation never drift from the
product.

Each "tour" in [`tours.ts`](./tours.ts) is one documented flow: an ordered list of steps with a
title, a caption and a `run` action that drives the UI into the state to capture. Running the tool
logs in, performs every step, saves a screenshot per step under `output/<tour-id>/NN-<shot>.png`,
and writes an `output/manifest.json` that pairs every screenshot with its caption.

The initial tours mirror the
[Web for users](https://doc.owncloud.com/webui/latest/owncloud_web/web_for_users.html)
documentation: the top navigation, the left and right sidebars, sharing roles, and contextual help.

## Run

This reuses the repository's Playwright install — no extra dependencies. Point it at a running
instance (defaults shown):

```bash
# from the repository root
OCIS_URL=https://localhost:9200 OCIS_USER=admin OCIS_PASSWORD=admin pnpm docs:screenshots
```

The tool seeds a little best-effort demo data first (a versioned file, a trashed item, a project
space and one incoming share) so the tours have something to show. Seeding is idempotent and
tolerant of failures, so it is safe to run repeatedly and against an instance where some of that
data already exists.

Generated screenshots and the manifest land in `tests/e2e/docs/output/` (git-ignored) — they are
build artefacts, regenerated on demand.

## Add a tour

Append an entry to `tours.ts` with `id`, `category`, `title`, `summary` and `steps`
(each `{ shot, title, caption, run }`), then run the capture again. No other changes are needed.
