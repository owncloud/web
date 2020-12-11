---
title: "Building from source"
date: 2018-05-02T00:00:00+00:00
weight: 20
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: building.md
---

{{< toc >}}

## Building ownCloud Web

- Run `yarn install` to install core dependencies
- Run `yarn install-all` to install dependencies of all apps and core
- Run `yarn dist` to build Web and all apps included in the `apps` folder

## Updating dependencies

- Run `yarn upgrade-all` to update core and app dependencies

## Cleaning up the workspace

- Run `yarn clean-all` to remove node_modules and dist folder

## Building the documentation

### Setting up

- Install [hugo](https://gohugo.io/getting-started/installing/)
- Run `make docs`

### Viewing the documentation

To view the rendered docs in the browser run:
```bash
cd hugo
hugo -D server
```

Then open "http://localhost:1313/"

When making changes to the docs, run `make docs` again and the server will pick up the changes and reload the page automatically

### Deploying the documentation

The documentation is automatically deployed from the master branch to https://owncloud.github.io/web/

