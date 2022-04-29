# End to end test suite

## Why end to end tests

Before we release a new web version, we always take care that nothing breaks and the core features are working as
expected. Till now this was a manual process which consumed a lot of time and effort.

Manual steps are error-prone by nature, on the one hand they can bring up unknown issues, but on the other it's easy to
forget some test steps. The main problem we faced, was that it's never a good thing to manually test your own code.

To get closer to the point where we are able to release faster and more often, we started to develop the end to end test suite.

## Structure

Currently, we only have cucumber tests in place (wrapping the playwright library), but maybe in the future we will also adopt playwright
and its own test suite to replace our integration tests. 

## Run end to end cucumber tests
Please make sure to point http://host.docker.internal/ to 127.0.0.1 by adding it to your hosts.

```shell
$ yarn && yarn build:w
$ docker-compose up oc10 ocis
$ yarn test:e2e:cucumber tests/e2e/cucumber/features
```

## Available options

Please read `tests/e2e/config.js` to see which options are supported.

```shell
$ OPTION_1=foo OPTION_2=bar yarn test:e2e:cucumber ...
```

## Package structure

This package is still in an early stage, design could change over time.

### Cucumber
`./tests/e2e/cucumber`
[Gherkin features](https://cucumber.io/docs/gherkin/reference/) and corresponding [Cucumber step definitions](https://cucumber.io/docs/cucumber/step-definitions/) placed in there, at the moment this is the only test implementation that can be used.

### Support
`./tests/e2e/support`
this package wraps everything that is needed to build tests. The implementation is high level and wraps playwright to drive web.

## Packages we use

* [cucumber-js](https://github.com/cucumber/cucumber-js)
* [playwright](https://github.com/microsoft/playwright)
