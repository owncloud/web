---
title: "Running acceptance tests"
date: 2021-07-27T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: testing.md
---

{{< toc >}}
## Introduction

In order to allow us to make changes quickly, often and with a high level of confidence, we heavily rely on tests within the `web` repository.

All the steps below require you to have the `web` repo cloned locally and dependencies installed. 
This can be achieved by running

```shell
$ git clone https://github.com/owncloud/web.git
$ cd web
$ yarn
```

### Unit & Integration Tests

We have a steadily growing coverage of both unit and integration tests. You can run them locally via

```shell
$ yarn test:unit
$ yarn test:integration
```

You can also specify which tests to run by giving a path param, like so: `yarn test:unit packages/<app-name>/tests/unit/path/to/test.spec.js`.

### Acceptance Tests

At ownCloud, we have decided to adopt Docker as the main environment for developing our application.
This also applies for running our acceptance tests. To run the tests without Docker on your local machine, please refer to the [manual testing guide]({{< ref "testing-manual.md" >}})

#### Prerequisites

To run acceptance tests with Docker, please make sure you have the following tools installed:

- docker
- docker-compose
- yarn
- node

Please also make sure to point `http://host.docker.internal/` to `127.0.0.1` by adding it to your hosts.

#### Prepare & start web

Bundle the web frontend, which then gets mounted into the respective backends. It also gets recompiled on changes.

```shell
$ yarn build:w
```

#### Start Docker

Using compose, you can start the required Docker containers by running

```shell
$ docker compose up oc10 ocis vnc selenium
```

and make sure there are no conflicting ports and everything runs smoothly. You can check if everything has worked by opening [https://host.docker.internal:9200](https://host.docker.internal:9200) (oCIS) and [http://host.docker.internal:8080](http://host.docker.internal:8080) (OC10) and logging in using the demo user (admin/admin).

If you're using a M1 Mac, you need to use `seleniarm/standalone-chromium:4.0.0-beta-1-20210215`for now. To do so, export `SELENIUM_IMAGE=seleniarm/standalone-chromium:4.0.0-beta-1-20210215`.

#### Run acceptance tests

Depending on the backend you're running the tests on, you can either run

```shell
$ yarn test:acceptance:oc10 tests/acceptance/features/path/to/test
```

for ownCloud 10.X or

```shell
$ yarn test:acceptance:ocis tests/acceptance/features/path/to/test
```

for oCIS acceptance tests.
#### Watch the test run

To watch the tests while running, open [http://host.docker.internal:6080/](http://host.docker.internal:6080/) in the browser to access your VNC client.


#### Watch the test report

If you want to create a report after the tests are done, run the command ```node tests/report```.
By default, the report gets generated to tests/report/cucumber_report.html.
The location can be changed by adding the ```--report-location``` flag.

To see all available options run ```node tests/report --help```.
