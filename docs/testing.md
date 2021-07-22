---
title: "Running acceptance tests"
date: 2020-04-15T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: testing.md
---

{{< toc >}}
## Introduction
At ownCloud we have decided to adopt docker as the main env for developing out application.
This also applies for running our tests. To run the tests without docker on your local machine please follow those steps... LINK_TO_OUTDATED_DOCS

## Prerequisites
- docker
- docker-compose
- yarn
- node
- http://host.docker.internal/ pointing to 127.0.0.1

## Prepare web
```shell
$ git clone https://github.com/owncloud/web.git web
$ cd web
$ yarn
$ yarn build:w
```

## Run Docker
if you're on a m1 mac you need to use `seleniarm/standalone-chromium:4.0.0-beta-1-20210215`for now. To do so export `SELENIUM_IMAGE=seleniarm/standalone-chromium:4.0.0-beta-1-20210215`.
```shell
$ cd web
$ docker compose up oc10 ocis vnc selenium
```

## Run Tests
```shell
$ cd web
$ yarn test:acceptance:oc10 tests/acceptance/features/path/to/test
```

## Watch test run
To watch the tests while running open http://host.docker.internal:6080/