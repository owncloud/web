---
title: 'Releasing'
weight: 25
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: releasing.md
---

{{< toc >}}

## Releasing ownCloud Web

OwnCloud Web can be hosted standalone or as part of oCIS.

### Versioning

We follow the [Semantic Versioning](https://semver.org/) scheme. Therefore, each change is of one of the possible types: `Bugfix, Change, Enhancement, Security`.

The highest type before a new release determines the version update number, so if it's only `Bugfix` and `Security` changes the next release will be a `PATCH` version bump, if there's at least one `Enhancement` within the changes this leads to a `MINOR` version bump, while `Change` type changes make for a new `MAJOR` release version.

### Release Guide

1. Create a branch `release-$version` in <https://github.com/owncloud/web>.
2. Create a folder in `changelog` for the release version and date `mkdir $major.$minor.$patchVersion_YYYY-MM-DD`.
3. Move all changelog items from the `changelog/unreleased/` folder to the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
4. Update the version in the following files (you can run `./dev/scripts/bump_versions.sh $version` if all get the same version):
   - `package.json`
   - `packages/design-system/package.json`
   - `packages/eslint-config/package.json`
   - `packages/web-pkg/package.json`
   - `packages/web-client/package.json`
   - `packages/web-test-helpers/package.json`
5. Commit and push your changes.
6. Run `./dev/scripts/create_and_push_tags.sh`. This script will create and push tags for the main app as well as all packages that need to be released.
7. After merging, wait for the CI to run on the merge commit.
8. Go to the [Releases section](https://github.com/owncloud/web/releases) and click "Draft a new Release".
9. The release artifacts will be created automatically.

### Next steps

For oCIS the release assets need to be updated.
