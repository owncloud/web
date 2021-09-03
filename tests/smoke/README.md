# WEB-Smoke-Tests (EXPERIMENTAL POC)

Use with care, the smoke-test package introduces many new concepts and is still under heavy development.

## Why smoke tests

Before we release a new web version, we always take care that nothing breaks and the core features are working as
expected. Till now this was a manual process which consumed a lot of time and effort.

Manual steps are error-prone by nature, on the one hand they can bring up unknown issues, but on the other it's easy to
forget some test steps. The main problem we faced, was that it's never a good thing to manually test your own code.

To get closer to the point where we are able to release faster and more often, we started to develop the WEB-Smoke-Tests
package.

## Why not as part of the tests/acceptance package

The tests/acceptance package has a much broader test scope and is here to test every little element // interaction in
ci. To guarantee that process, a lot of steps are required which takes a lot of time and isn't the perfect fit for local
development.

The WEB-Smoke-Tests are much smaller and are still in an early phase. Many things are still not there compared to the
mature tests/acceptance package.

**The main reasons why we decided to split out the smoke tests are:**

* we wanted to test on a persona // use-case level
* testing should be easy, fast and reliable
* no external dependencies expect a backend
* strongly typed page-objects, steps and helpers
* develop, test manually, extend automatic tests, release, repeat

## Run a smoke test

Please make sure to point http://host.docker.internal/ to 127.0.0.1 by adding it to your hosts.

```shell
$ yarn && yarn build:w
$ docker-compose up oc10 ocis
$ yarn test:smoke:experimental tests/smoke/features/kindergarten.feature
```

## Available options

To run the tests with below options, you have to set them as environment variable in you shell.

```shell
$ OPTION_1=foo OPTION_2=bar yarn test:smoke:experimental ...
```

* **OCIS=boolean**
    * defines if the tests should use ocis as backend
    * **default**: false
* **SLOW_MO=time-in-ms**
    * run the tests with a timeout between every interaction
    * **default**: 0
* **HEADLESS=boolean**
    * run the tests without opening a browser
    * **default**: false
* **BROWSER=string**
    * define which browser is used to run the tests
    * **default**: chrome
    * **values**: firefox | webkit | chrome | chromium

## Package structure

This package is still in an early stage, design could change over time.

### Features
`./tests/smoke/features`
[Gherkin features](https://cucumber.io/docs/gherkin/reference/) and corresponding [Cucumber step definitions](https://cucumber.io/docs/cucumber/step-definitions/) placed in there, it follows

### Support
`./tests/smoke/support`
everything that is needed to run the tests organize as package 

`./tests/smoke/support/api`
Every call that is used to provision, configure or even request data from backend will be placed here

`./tests/smoke/support/cta`
(Call to action) - Snippets that can be used across the entire livecycle of a test

`./tests/smoke/support/cucumber`
Mainly all cucumber related things, for now only setup is done here

`./tests/smoke/support/page`
With the option in mind that the smoke-test package could grow, we decided to already group interactions inside page
objects. To get more background what page objects are, you can read
the [introduction here](https://playwright.dev/docs/pom/)

`./tests/smoke/support/store`
Simple store to persist data for the lifetime of a test

`./tests/smoke/support/world`
Custom world that is used across the tests, global objects like services get initialized there. [Read more](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md)

## Packages we use

* [cucumber-js](https://github.com/cucumber/cucumber-js)
* [playwright](https://github.com/microsoft/playwright)
