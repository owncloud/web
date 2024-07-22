---
title: 'Repo structure and (published) packages'
date: 2022-01-28T00:00:00+00:00
weight: 30
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/development
geekdocFilePath: repo-structure.md
---

{{< toc >}}

## Repository Structure

From a developer's perspective, the most important parts of the [ownCloud Web repo](https://github.com/owncloud/web) are the following files and folders:

### dev Folder and docker-compose.yml File

The `/dev` folder contains all the configuration files that are needed in the `docker-compose.yml` file. This docker compose stack
contains all the backend and testing related infrastructure that is needed for an out-of-the-box usable localhost development setup,
as described in the [tooling section]({{< ref "tooling.md" >}}).

### docs Folder

Within the `/docs` folder you will find all the documentation source documents that get published to the [dev docs](https://owncloud.dev/clients/web/).

### packages Folder

We're using the [ownCloud Web repo](https://github.com/owncloud/web) as a mono repo. It contains a variety of packages. Some of them get
published to [npmjs.com](https://npmjs.com), others define the core packages, apps and extensions that are the foundation of
the `ownCloud Web` release artifact.

Having these packages side by side within the `/packages` folder of the repo is possible because of a `pnpm` feature called `Workspaces`. You can learn more about that by visiting the [pnpm docs](https://pnpm.io/workspaces).

### tests Folder

We're using the [Playwright](https://playwright.dev) for UI testing. The UI tests are located in the `/tests/e2e`

You're more than welcome to make a pull request and adjust this section of the docs accordingly. :-)
You can read more about testing in our [testing section]({{< ref "../testing/_index.md" >}})

### package.json File

This is probably no surprise: the root level `package.json` file defines the project information, build scripts, dependencies and some more details.
Each package in `/packages` can and most likely will contain another `package.json` which does the same for the respective package.

### vite.config.ts

We're working with [Vite](https://vitejs.dev) as a local development server and build tool. `vite.config.ts` is the main configuration file for that.
You can read more about the usage in our [tooling section]({{< ref "tooling.md" >}}).

## (Published) Packages

Each package in the `/packages` folder can - not exclusively, but most commonly - consist of

- source code (`/src`),
- unit tests (`/tests`),
- translations (`/l10n`) and
- a `package.json` file for package specific details and dependencies.

### Code Style and Build Config

Some of our packages in `/packages` are pure helper packages which ensure a common code style and build configuration for all our
internal (mono repo) and external packages. We encourage you to make use of the very same packages. This helps the community
understand code more easily, even when coming from different developers or vendors in the ownCloud Web ecosystem.

Namely those packages are

- `/packages/babel-preset`
- `/packages/eslint-config`
- `/packages/extension-sdk`
- `/packages/prettier-config`
- `/packages/tsconfig/`

### ownCloud Design System

The ownCloud Design System (`/packages/design-system`) is a collection of components, design tokens and styles which ensure a
unique and consistent look and feel and branding throughout the ownCloud Web ecosystem. We hope that you use it, too, so that your
very own apps and extensions will blend in with all the others. Documentation and code examples can be found in
the [design system documentation](https://owncloud.design).

The ownCloud Design System is a standalone project, but to make development easier we have the code in our mono repo.
We're planning to publish it on npmjs.com as [@ownclouders/design-system](https://www.npmjs.com/package/@ownclouders/design-system)
as soon as possible. Since it's bundled with ownCloud Web, you should not bundle it with your app or extension.

### web-client

The client package (`/packages/web-client`) serves as an abstraction layer for the various ownCloud APIs, like
[LibreGraph](https://owncloud.dev/apis/http/graph/), [WebDAV](https://doc.owncloud.com/server/next/developer_manual/webdav_api/) and
[OCS](https://doc.owncloud.com/server/next/developer_manual/core/apis/ocs-capabilities.html). The package provides TypeScript
interfaces for various entities (like files, folders, shares and spaces) and makes sure that raw API responses are properly
transformed so that you can deal with more useful objects. The web-client package gets published
on npmjs.com as [@ownclouders/web-client](https://www.npmjs.com/package/@ownclouders/web-client).

Dedicated documentation for the `web-client` package is not available, yet, since our extension system is still work in progress. However, the package's [README.md](https://github.com/owncloud/web/blob/master/packages/web-client/README.md) gives you a few examples on how to use it.

### web-pkg

The web-pkg package (`/packages/web-pkg`) is a collection of opinionated components, composables, types and other helpers that aim
at making your app and extension developer experience as easy and seamless as possible. The web-pkg package gets published on
npmjs.com as [@ownclouders/web-pkg](https://www.npmjs.com/package/@ownclouders/web-pkg).

Dedicated documentation for the `web-pkg` package is not available, yet, since our extension system is still work in progress.

### web-runtime

At the very heart of ownCloud Web, the `web-runtime` is responsible for dependency injection, app bootstrapping, configuration,
authentication, data preloading and much more.
It is very likely that you will never get in touch with it as most of the developer-facing features are exposed via `web-pkg`. If you
have more questions about this package, please join our [public chat](https://talk.owncloud.com/channel/web) and simply ask
or write an issue in our [issue tracker](https://github.com/owncloud/web/issues).

### Standalone Core Apps

Both `web-app-admin-settings` and `web-app-files` are standalone apps which are bundled with the default ownCloud Web release artifact.

### Viewer and Editor Apps

Apps which fall into the categories `viewer` or `editor` can be opened from the context of a file or folder. This mostly happens from
within the `files` app. We currently bundle the following apps with the default ownCloud Web release artifact:

- `web-app-external` an iframe integration of all the apps coming from the [app provider](https://owncloud.dev/services/app-provider/)
  (e.g. OnlyOffice, Collabora Online and others)
- `web-app-pdf-viewer` a viewer for `.pdf` files, which relies on native PDF rendering support from the browser
- `web-app-preview` a viewer for various media files (audio / video / image formats)
- `web-app-text-editor` a simple editor for `.txt`, `.md` and other plain text files

If you're interested in writing your own viewer or editor app for certain file types, please get in touch with us for more info.
