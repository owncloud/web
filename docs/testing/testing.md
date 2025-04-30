---
title: 'Running tests'
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
$ pnpm install
```

### Unit Tests

We have a steadily growing coverage of unit tests. You can run them locally via

```shell
$ pnpm test:unit
```

You can also specify which tests to run by giving a path param, like so: `pnpm test:unit packages/<app-name>/tests/unit/path/to/test.spec.js`.

#### Unit Test File Structure

Our unit tests spec files follow a simple structure:

- fixtures and mocks at the top
- helper functions at the bottom
- tests in between

We usually organize tests with nested `describe` blocks. If you would like to get feedback from the core team about
the structure, scope and goals of your unit tests before actually writing some, we invite you to make a pull request
with only `describe` blocks and nested `it.todo("put your test description here")` lines.

### E2E Tests (Playwright)

Our end-to-end test suite is built upon the [Playwright Framework](https://github.com/microsoft/playwright),
which makes it easy to write tests, debug them and have them run cross-browser with minimal overhead.

#### Preparation

Please make sure you have installed all dependencies and started the server(s) as described in [tooling]({{< ref "tooling.md#development-setup" >}}).

#### Prepare Web

Bundle the web frontend with the following command:

```shell
$ pnpm build
```

Our compose setup automatically mounts it into an oCIS backend, respectively. Web also gets recompiled on changes.

#### Start Web

Start the web with the following command:

```shell
docker compose up
```

This will start all the services. The ENV variables specific to each services are defined in the `docker-compose.yml` file.

#### Run E2E Tests

The following command will run all available e2e tests:

```shell
$ pnpm test:e2e:cucumber 'tests/e2e/cucumber/**/*.feature'
```

#### Options

To run a particular test, simply add the feature file and line number to the test command, e.g. `pnpm test:e2e:cucumber tests/e2e/cucumber/features/smoke/admin-settings/users.feature:84`

Various options are available via ENV variables, e.g.

- `BASIC_AUTH=true` use basic authorization for api requests.
- `RETRY=n` to retry failures `n` times
- `SLOW_MO=n` to slow the execution time by `n` milliseconds
- `TIMEOUT=n` to set tests to timeout after `n` milliseconds
- `HEADLESS=bool` to open the browser while the tests run (defaults to true => headless mode)
- `BROWSER=name` to run tests against a specific browser. Defaults to chromium, available are chromium, firefox, webkit, chromium
- `ADMIN_PASSWORD` to set administrator password. By default, the `admin` password is used in the test

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

#### Lint E2E Test Code

Run the following command to find out the lint issues early in the test codes:

```shell
$ pnpm lint
```

And to fix the lint problems run the following command:

```shell
$ pnpm lint --fix
```

If the lint problems are not fixed by `--fix` option, we have to manually fix the code.

### Analyze the Test Report

The cucumber library is used as the test runner for e2e tests. The report generator script lives inside the `tests/e2e/cucumber/report` folder. If you want to create a report after the tests are done, run the command:

```bash
node tests/e2e/cucumber/report --report-input=tests/e2e/cucumber/report/report.json
```

By default, the report gets generated to reports/e2e/cucumber/releaseReport/cucumber_report.html.
The location can be changed by adding the `--report-location` flag.

To see all available options run

```bash
node tests/e2e/cucumber/report --help
```

### E2E Tests on oCIS With Keycloak

We can run some of the e2e tests on oCIS setup with Keycloak as an external idp. To run tests against locally, please follow the steps below:

#### Run oCIS With Keycloak

There's a documentation to serve [oCIS with Keycloak](https://owncloud.dev/ocis/deployment/ocis_keycloak/). Please follow each step to run **oCIS with Keycloak**.

#### Run E2E Tests

```bash
KEYCLOAK=true \
BASE_URL_OCIS=ocis.owncloud.test \
pnpm run test:e2e:cucumber tests/e2e/cucumber/features/journeys
```

Following environment variables come in use while running e2e tests on oCIS with Keycloak:

- `BASE_URL_OCIS` sets oCIS url (e.g.: ocis.owncloud.test)
- `KEYCLOAK_HOST` sets Keycloak url (e.g.: keycloak.owncloud.test)
- `KEYCLOAK=true` runs the tests with Keycloak
- `KEYCLOAK_REALM` sets oCIS realm name used on Keycloak

### E2E Tests With Predefiend Users (`@predefined-users`)

It is possible to run e2e tests with predefined users. This is useful for running tests in a production-like environment.
The following environment variables are used to run the tests with predefined users:

- `PREDEFINED_USERS`: `true`|`false`
- `PREDEFINED_USERS_FILE`: path to a JSON file mapping predefined users

We have to create a JSON file that contains the mapping of the users. JSON file MUST contain the following keys:

```json
{
 "alice": {// map user},
 "brian": {// mapuser},
 "carol": {// mapuser},
}
```

And the user object MUST have the following properties defined:

```json
{
  "id": "<usernmae>",
  "displayName": "<display-name>",
  "password": "<password>",
  "email": "<email>"
}
```

A complete example of a JSON file.

```json
{
  "alice": {
    "id": "einstein",
    "displayName": "Albert Einstein",
    "password": "relativity",
    "email": "einstein@example.org"
  },
  "brian": {
    "id": "marie",
    "displayName": "Marie Skłodowska Curie",
    "password": "radioactivity",
    "email": "marie@example.org"
  },
  "carol": {
    "id": "moss",
    "displayName": "Maurice Moss",
    "password": "vista",
    "email": "moss@example.org"
  }
}
```

The test scenarios that can run with predefined users are marked with the `@predefined-users` tag and can be run with the following command:

```bash
PREDEFINED_USERS=true \
PREDEFINED_USERS_FILE='<path-to>/users.json' \
pnpm test:e2e:cucumber tests/e2e/cucumber/features/file-action/rename.feature --tags '@predefined-users'
```

**The following tests cannot be run with predefined users:**

All tests which are related to:

- Admin Actions
- Groups
