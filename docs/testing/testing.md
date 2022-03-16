---
title: "Running acceptance tests"
date: 2021-07-27T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/testing
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

#### Unit test file structure
Our unit tests spec files follow a simple structure:
- fixtures and mocks at the top
- helper functions at the bottom
- tests in between

### E2E Tests (Playwright)

Our end-to-end test suite is built upon [Playwright Framework](https://github.com/microsoft/playwright), 
which makes it easy to write tests, debug them and have them run cross-browser with minimal overhead.

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

For running the test with oc10 run
```shell
$ docker compose up oc10
```

For running the test with ocis run
```shell
$ docker compose up ocis
```

and make sure there are no conflicting ports and everything runs smoothly. You can check if everything has worked by opening [https://host.docker.internal:9200](https://host.docker.internal:9200) (oCIS) and [http://host.docker.internal:8080](http://host.docker.internal:8080) (OC10) and logging in using the demo user (admin/admin).

#### Run E2E tests

Depending on the backend you want to run the tests on, you can either run

```shell
$ yarn test:e2e:cucumber tests/e2e/cucumber
```

for an ownCloud 10 backend or

```shell
$ OCIS=true yarn test:e2e:cucumber tests/e2e/cucumber
```

for an oCIS backend.

#### Options

To run a particular test, simply add the feature file and line number to the test command, e.g. `yarn test:e2e:cucumber tests/e2e/cucumber/shareFileJourney.feature:13`

Various options are available via ENV variables, e.g.
- `OCIS=true` to run the E2E tests against an oCIS backend
- `RETRY=n` to retry failures `n` times
- `SLOW_MO=n` to slow the execution time by `n` milliseconds
- `TIMEOUT=n` to set tests to timeout after `n` milliseconds
- `HEADLESS=bool` to open the browser while the tests run (defaults to true => headless mode)
- `BROWSER=name` to run tests against a specific browser. Defaults to Chrome, available are Chrome, Firefox, Webkit, Chromium

For debugging reasons, you may want to record a video or traces of your test run. 
Again, you can use the following ENV variables in your command:

- `REPORT_DIR=another/path` to set a directory for your recorded files (defaults to "reports")
- `REPORT_VIDEO=true` to record a video of the test run
- `REPORT_HAR=true` to save request information from the test run
- `REPORT_TRACING=true` to record traces from the test run

To then open e.g. the tracing from the `REPORT_DIR`, run

```shell
$ npx playwright show-trace path/to/file.zip
```

### Acceptance Tests (Nightwatch)

At ownCloud, we have decided to adopt Docker as the main environment for developing our application.
This also applies for running our acceptance tests. To run the tests without Docker on your local machine, please refer to the [manual testing guide]({{< ref "acceptance-tests-all.md" >}})

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

For running the test with oc10 run
```shell
$ docker compose up oc10 vnc selenium middleware-oc10
```

For running the test with ocis run
```shell
$ docker compose up ocis vnc selenium middleware-ocis
```

and make sure there are no conflicting ports and everything runs smoothly. You can check if everything has worked by opening [https://host.docker.internal:9200](https://host.docker.internal:9200) (oCIS) and [http://host.docker.internal:8080](http://host.docker.internal:8080) (OC10) and logging in using the demo user (admin/admin).

If you're using a M1 Mac, you need to use `seleniarm/standalone-chromium:4.0.0-beta-1-20210215`for now. To do so, export `SELENIUM_IMAGE=seleniarm/standalone-chromium:4.0.0-beta-1-20210215`.

#### Run acceptance tests

- Change the directory to `tests/acceptance`
- Install all the test dependencies with `yarn` command
- Depending on the backend you're running the tests on, you can either run

  ```shell
  $ yarn test:acceptance:oc10 features/path/to/test
  ```

  for ownCloud 10.X or

  ```shell
  $ yarn test:acceptance:ocis features/path/to/test
  ```

  for oCIS acceptance tests.


#### Watch the test run

To watch the tests while running, open [http://host.docker.internal:6080/](http://host.docker.internal:6080/) in the browser to access your VNC client.


#### Watch the test report

If you want to create a report after the tests are done, run the command ```node tests/e2e/cucumber/report```.
By default, the report gets generated to reports/e2e/cucumber/releaseReport/cucumber_report.html.
The location can be changed by adding the ```--report-location``` flag.

To see all available options run ```node tests/e2e/cucumber/report --help```.
