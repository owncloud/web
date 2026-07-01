Enhancement: Add a documentation screenshot capture tool

We added a Playwright-based tool under `tests/e2e/docs` that automatically captures end-user
documentation screenshots from a live ownCloud Web instance. Each "tour" drives the UI through a
documented flow and saves a captioned screenshot per step plus a `manifest.json`, so the
screenshots used in the user documentation can be regenerated on demand and never drift from the
product. The initial tours mirror the "Web for users" documentation: the top navigation, the file
sidebars, sharing roles and contextual help.

https://github.com/owncloud/web/pull/13894
