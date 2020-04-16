---
title: "Building the documentation"
date: 2020-04-15T00:00:00+00:00
weight: 80
geekdocRepo: https://github.com/owncloud/phoenix
geekdocEditPath: edit/master/docs
geekdocFilePath: building-docs.md
---

{{< toc >}}

## Buildling the documentation

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

The documentation is automatically deployed from the master branch to https://owncloud.github.io/phoenix/

