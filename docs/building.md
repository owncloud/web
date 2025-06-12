---
title: "Building From Source"
date: 2018-05-02T00:00:00+00:00
weight: 20
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: building.md
---

{{< toc >}}

## Building ownCloud Web

- Run `pnpm install` to install dependencies
- Run `pnpm build` to build Web and all apps included in the `packages` folder

### Updating Dependencies

- **Do not** update dependencies by yourself but use the provided ones by the repo. When rebasing your local clone, you can always run `pnpm install` to be in sync with the defined dependencies.

## Building the Documentation

Note that the documentation is located in the `docs/` folder. 

### Install Hugo

- There is no need to install Hugo, the framework that generates the documentation. You can install the required version for other projects. Hugo is used via a predefined container that is downloaded if it does not exist.
- To meet the sole requirement of building docs, Docker must be installed on your computer.

### Run a Docs Build

- Run `make docs` from the root of the local web clone.

### Viewing the Documentation

- Run `make docs-serve` to start a mini webserver for the rendered docs.
- Open with a browser `http://localhost:1313/`
- When making changes to the docs, start with a docs build as described above.

### Deploying the documentation

The documentation is automatically deployed from the master branch to https://owncloud.dev/clients/web/

### Building Information

During the building process, the documentation requests that the `owncloud.github.io` repo be cloned locally into the `docs/` folder. This repository contains all the necessary files and processes to build and serve the documentation.
