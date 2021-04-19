---
title: "Releasing"
weight: 25
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: releasing.md
---

{{< toc >}}

## Releasing ownCloud Web

OwnCloud Web can be hosted standalone, as ownCloud 10 app or as part of oCIS. 

### Versioning

We follow the [Semantic Versioning](https://semver.org/) scheme. Therefore, each change is of one of the possible types: `Bugfix, Change, Enhancement, Security`.

The highest type before a new release determines the version update number, so if it's only `Bugfix` and `Security` changes the next release will be a `PATCH` version bump, if there's at least one `Enhancement` within the changes this leads to a `MINOR` version bump, while `Change` type changes make for a new `MAJOR` release version.

### Release Guide

1. Create a branch `release-$version` in <https://github.com/owncloud/web>.
2. Create a folder in `changelog` for the release version and date `mkdir $major.$minor.$patchVersion_YYYY-MM-DD`.
3. Move all changelog items from the `changelog/unreleased/` folder to the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
4. Update the version in `packages/web-integration-oc10/appinfo/info.xml`
5. Update the version in `package.json`
6. Commit your changes.
7. After merging, wait for the CI to run on the merge commit.
8. Go to the [Releases section](https://github.com/owncloud/web/releases) and click "Draft a new Release".
9. Use `v$major.$minor.$patch` as a tag (the `v` prefix is important) and publish it.
10. The tag and the Release artifacts will be created automatically.

### Next steps

- The ownCloud 10 app gets created as part of the release pipeline and will be part of the [release assets](https://github.com/owncloud/web/releases).
- For oCIS the release assets need to be updated. For that we have prepared a [separate ocis-web release guide](https://owncloud.dev/extensions/web/releasing/).
