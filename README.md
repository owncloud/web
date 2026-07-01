# ownCloud Web

<!-- OSPO-managed README | Generated: 2026-04-16 | v2 -->

[![License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE) [![ownCloud OSPO](https://img.shields.io/badge/OSPO-ownCloud-blue)](https://kiteworks.com/opensource) [![Docker Hub](https://img.shields.io/docker/pulls/owncloud/web)](https://hub.docker.com/r/owncloud/web)

ownCloud Web is the next-generation frontend for ownCloud Infinite Scale, built as a single-page application with Vue.js and TypeScript. It provides a modern, accessible and themeable user interface for managing files, sharing, real-time collaboration and administration -- designed to be extensible through a plugin-based architecture that allows third-party developers to build custom apps and extensions.

## Part of oCIS

ownCloud Web is the primary frontend for [ownCloud Infinite Scale (oCIS)](https://github.com/owncloud/ocis). Starting with version 7.1.0, the Web UI supports only oCIS as a backend (for ownCloud 10 compatibility, use version 7.0.2).

ownCloud Web is available on [Docker Hub](https://hub.docker.com/r/owncloud/web).

**Live Demo:** [https://demo.owncloud.com/](https://demo.owncloud.com/)

## Getting Started

Set up a local development environment for ownCloud Web:

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/)
- [Docker Compose](https://docs.docker.com/compose/) (for backend)

For the complete development setup, see the [setup guide](https://owncloud.dev/clients/web/getting-started/).

### Repository Structure

The `packages` directory contains the core modules:

- **client** -- Generated TypeScript client for the oCIS Graph API
- **container** -- Static assets and base files
- **extension-sdk** -- Utilities for developing custom extensions
- **pkg** -- Shared logic used across the codebase
- **runtime** -- Authentication, routing, theming and application handling

Built-in apps (also in `packages`):

- **files** -- Core file sync-and-share functionality
- **admin-settings** -- User, group and space administration
- **activities** -- Activity stream
- **app-store** -- Browse and install extensions
- **epub-reader** -- Ebook file viewer
- **external** -- WOPI-based document editing (Collabora, ONLYOFFICE)
- **pdf-viewer** -- PDF file viewer
- **preview** -- Audio, video and image previewer
- **text-editor** -- Plain text editor

## Documentation

- [ownCloud Web Documentation](https://owncloud.dev/clients/web)
- [Development Guide](https://owncloud.dev/clients/web/getting-started/)
- [Extension System](https://owncloud.dev/clients/web/extension-system/)
- [Testing Documentation](https://owncloud.dev/clients/web/testing/testing/)
- [Repository Structure](https://owncloud.dev/clients/web/development/repo-structure/)

## Community & Support

**[Star](https://github.com/owncloud/web)** this repo and **Watch** for release notifications!

- [ownCloud Website](https://owncloud.com)
- [Community Discussions](https://github.com/orgs/owncloud/discussions)
- [Matrix Chat](https://app.element.io/#/room/#owncloud:matrix.org)
- [Documentation](https://doc.owncloud.com)
- [Enterprise Support](https://owncloud.com/contact-us/)
- [OSPO Home](https://kiteworks.com/opensource)

## Contributing

We welcome contributions! Please read the [Contributing Guidelines](CONTRIBUTING.md)
and our [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

### Workflow

- **Rebase Early, Rebase Often!** We use a rebase workflow. Always rebase on the target branch before submitting a PR.
- **Dependabot**: Automated dependency updates are managed via Dependabot. Review and merge dependency PRs promptly.
- **Signed Commits**: All commits **must** be PGP/GPG signed. See [GitHub's signing guide](https://docs.github.com/en/authentication/managing-commit-signature-verification).
- **DCO Sign-off**: Every commit must carry a `Signed-off-by` line:
  ```
  git commit -s -S -m "your commit message"
  ```
- **GitHub Actions Policy**: Workflows may only use actions that are (a) owned by `owncloud`, (b) created by GitHub (`actions/*`), or (c) verified in the GitHub Marketplace.

## Translations

Help translate this project on Transifex:
**<https://explore.transifex.com/owncloud-org/owncloud-web/>**

Please submit translations via Transifex -- do not open pull requests for translation changes.

## Security

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities at **<https://security.owncloud.com>** -- see [SECURITY.md](SECURITY.md).

Bug bounty: [YesWeHack ownCloud Program](https://yeswehack.com/programs/owncloud-bug-bounty-program)

## License

This project is licensed under the [AGPL-3.0](LICENSE).

## About the ownCloud OSPO

The [Kiteworks Open Source Program Office](https://kiteworks.com/opensource), operating under
the [ownCloud](https://owncloud.com) brand, launched on May 5, 2026, to steward the open source
ecosystem around ownCloud's products. The OSPO ensures transparent governance, license compliance,
community health, and sustainable collaboration between the open source community and
[Kiteworks](https://www.kiteworks.com), which acquired ownCloud in 2023.

- **OSPO Home**: <https://kiteworks.com/opensource>
- **GitHub**: <https://github.com/owncloud>
- **ownCloud**: <https://owncloud.com>

For questions about the OSPO or licensing, contact ospo@kiteworks.com.

### License Migration to Apache 2.0

The OSPO is driving a strategic relicensing of ownCloud repositories toward the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), following
the [Apache Software Foundation's third-party license policy](https://www.apache.org/legal/resolved.html).

Individual repositories will migrate as their audit is completed. The LICENSE file
in each repo reflects its **current** license status (not the target).

**Current license: AGPL-3.0** (Category X per Apache policy -- cannot be included in Apache-2.0 works).

Migration prerequisites for this repository:

- **CLA/DCO coverage**: All past contributors must have signed agreements permitting relicensing
- **Copyleft dependency audit**: All AGPL/GPL dependencies must be replaced or isolated
- **KDE heritage review**: Any code with KDE-era copyrights requires legal analysis
- **Complete relicensing**: AGPL-3.0 is a strong copyleft license; migration requires full relicensing of all files, not just a header change
