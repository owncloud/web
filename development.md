---
title: "Development"
date: 2022-01-28T00:00:00+00:00
weight: 50
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: development.md
---

{{< toc >}}

This is a collection of tips and conventions to follow when working on [the ownCloud web frontend](https://github.com/owncloud/web). 
It is a living document, please open a PR if you find something missing.

## Contributing to ownCloud web

Everyone is invited to contribute. Simply fork [the codebase](), check [the issues](https://github.com/owncloud/web/issues?q=is%3Aopen+is%3Aissue+label%3ATopic%3Agood-first-issue) for a suitable one and open a pull request!

### Linting and tests

To make sure your pull request can be efficiently reviewed and won't need a lot of changes down the road, please run the linter and the unit&integration tests via `yarn lint --fix` and `yarn test:unit && yarn test:integration` locally. [Our CI](https://drone.owncloud.com/owncloud/web) will run on pull requests and report back any problems after that. For a further introduction on how we handle testing, please head to the [testing docs]({{< ref "testing/_index.md" >}}).

### Changelog items

In our project, we follow [SemVer](https://semver.org/) and keep a changelog for every change that influences the user experience (where "users" can be admins, end-users and extension developers).
Some changes, like refactoring, updating dependencies or adding tests don't require a changelog item.

Please add a changelog item to the `changelog/unreleased/` folder, referencing the issue and pull request numbers, following the [changelog item template](https://github.com/owncloud/web/blob/master/changelog/TEMPLATE). 

## Code Conventions

### Early returns

We're trying to stick with early returns in our code to make it more performant and simpler to reason about it.

### Translations

Use `v-translate` (or `v-text` in combination with computed properties) inside HTML tags (instead of a `<translate tag="h1">` or similar) in order to make reasoning about the DOM tree easier.

### TypeScript

We're currently migrating our projects from JavaScript to TypeScript, providing for type safety. cleaner interfaces and making sure our IDEs can support us in reasoning about our (ever growing, complex) codebase.

### Dependencies

To keep the bundle size small and reduce the risk of introducing security problems for our users, we try to limit the amount of dependencies in our projects and keep them as up-to-date as possible.
