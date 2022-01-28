---
title: "Setup with oCIS"
date: 2020-04-15T00:00:00+00:00
weight: 50
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: backend-ocis.md
---

{{< toc >}}

## Setting up oCIS services

- Setup oCIS by following the [setup instructions](https://owncloud.dev/ocis/getting-started/).
- Kill the oCIS Web service `./ocis kill web`

## Setting up Web

- Copy `./config/config.json.sample-ocis` to `./config/config.json` and adjust values if required

## Running Web

- in the Web checkout folder, run `yarn serve`
- open [https://localhost:9200](https://localhost:9200) and accept the certificate.
- when signing in, use one of the [available demo users](https://owncloud.dev/ocis/getting-started/demo-users/)
- whenever code changes are made, you need to manually reload the browser page (no hot reload)

## Running acceptance tests

For testing, please refer to the [testing docs]({{< ref "testing/_index.md" >}})

