---
title: 'Releasing'
weight: 25
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: releasing.md
---

{{< toc >}}

## Releasing ownCloud Web

OwnCloud Web can be hosted standalone for a dedicated oCIS backend or bundled as part of oCIS.

### Versioning

We follow the [Semantic Versioning](https://semver.org/) scheme. Therefore, each change is of one of the possible types: `Bugfix, Change, Enhancement, Security`.

The highest type before a new release determines the version update number, so if it's only `Bugfix` and `Security` changes the next release will be a `PATCH` version bump, if there's at least one `Enhancement` within the changes this leads to a `MINOR` version bump, while `Change` type changes make for a new `MAJOR` release version.

### Release Guide

1. Create a branch `release-$version` in <https://github.com/owncloud/web>.
2. Create a folder in `changelog` for the release version and date `mkdir $major.$minor.$patchVersion_YYYY-MM-DD`.
3. Move all changelog items from the `changelog/unreleased/` folder to the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
4. Run `./dev/scripts/bump_versions.sh $version`. This script will bump the `package.json` files in all relevant packages.
5. Commit and push your changes.
6. Run `./dev/scripts/create_and_push_tags.sh`. This script will create and push tags for the main app as well as all packages that need to be released.
7. After merging, wait for the CI to run on the merge commit.
8. Go to the [Releases section](https://github.com/owncloud/web/releases) and click "Draft a new Release".
9. The release artifacts will be created automatically.

### Next steps

For oCIS the release assets need to be updated.

<!-- TODO: add reference to docs on how to update Web in oCIS -->
