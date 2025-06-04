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

- Install [hugo](https://gohugo.io/getting-started/installing/)\
{{< hint warning >}}
It is **VERY** important to have the same hugo version installed as defined in the [ocis](https://github.com/owncloud/ocis/) repo.
The relevant file/command to look at is `cat .bingo/Variables.mk | grep HUGO`. At the time of writing, the version is `v0.123.7`. Using any other version will break building docs in the web repo.
<!-- the required/correlated theme version is defined in: https://github.com/owncloud/owncloud.github.io/blob/main/Makefile -->
{{< /hint >}}

### Run a Docs Build

- Run `make docs` from the root of the local web clone.

### Viewing the Documentation

- Run `make docs-serve` to start a mini webserver for the rendered docs.
- Open with a browser `http://localhost:1313/`
- When making changes to the docs, start with a docs build as described above.

### Deploying the documentation

The documentation is automatically deployed from the master branch to https://owncloud.dev/clients/web/

