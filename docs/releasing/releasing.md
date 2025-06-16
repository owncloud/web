---
title: 'Releasing'
weight: 25
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: releasing.md
---

{{< toc >}}

## Releasing ownCloud Web

ownCloud Web can be hosted standalone for a dedicated oCIS backend or bundled as part of oCIS.

### Versioning

We follow the [Semantic Versioning](https://semver.org/) scheme. Therefore, each change is of one of the possible types: `Bugfix, Change, Enhancement, Security`.

The highest type before a new release determines the version update number, so if it's only `Bugfix` and `Security` changes the next release will be a `PATCH` version bump, if there's at least one `Enhancement` within the changes this leads to a `MINOR` version bump, while `Change` type changes make for a new `MAJOR` release version.

### Release Guide

#### Releasing a New Major Version

1. Checkout the latest `stable-$major` branch\
This branch will be used as the base for the new major version branch.\
Replace `$major` with the **last** released major version.
2. Create a new branch `stable-$major`.\
Replace `$major` with the **new** major version.
3. Push the newly created `stable-$major` branch
4. Create and checkout a new branch `chore/bump-version-$major.$minor.$patch` using the branch from previous step as base\
Replace `$major`, `$minor` and `$patch` with the new version.
5. Cherry pick all required changes from `master` into the current branch
6. Create a new sub-folder in the `/changelog/` folder using the release version and current date `mkdir $major.$minor.$patch_$YYYY-MM-DD`\
Replace `$major`, `$minor` and `$patch` with the new version and `$YYYY-MM-DD` with the current date in the format `YYYY-MM-DD`.
7. Move all changelog items from the `/changelog/unreleased/` folder into the `$major.$minor.$patch_$YYYY-MM-DD` folder created in the previous step
8. Run `make l10n-pull` to pull the translations\
This command will pull the latest translations from Transifex into the current branch and saves them in the `/packages/*/l10n/` folders.
9. Run `make l10n-write` to write the translations\
This command will use translations pulled in the previous step and writes them to the `/packages/*/l10n/translations.json` files.
10. Run `./dev/scripts/bump_versions.sh $major.$minor.$patch`.\
This script will bump the `package.json` files in all relevant packages and the sonar cloud project version\
Replace `$major`, `$minor` and `$patch` with the new version.
11. Commit and push your changes.
12. Create a PR with tag `[full-ci]` in the title at the beginning to merge the `chore/bump-version-$major.$minor.$patch` branch into the new `stable-$major` branch
13. After merging, checkout the new `stable-$major` branch again
14. Run `./dev/scripts/create_and_push_tags.sh`\
This script will create and push tags for the main app as well as all packages that need to be released
15. The GitHub release will be created automatically together with the release artifacts


#### Releasing a New Minor or Patch Version

1. Checkout the latest `stable-$major` branch\
This branch will be used as the base for the bump version branch.\
Replace the `$major` with the last released major version.
2. Create a new branch `chore/bump-version-$major.$minor.$patch`\
Replace `$major`, `$minor` and `$patch` with the new version.
3. Cherry pick all required changes from `master` into the current branch
4. Create a new sub-folder in the `/changelog/` folder using the release version and current date `mkdir $major.$minor.$patch_$YYYY-MM-DD`\
Replace `$major`, `$minor` and `$patch` with the new version and `$YYYY-MM-DD` with the current date in the format `YYYY-MM-DD`.
5. Move all changelog items from the `/changelog/unreleased/` folder into the `$major.$minor.$patch_$YYYY-MM-DD` folder created in previous step
6. Run `make l10n-pull` to pull the translations\
This command will pull the latest translations from Transifex into the current branch and saves them in the `/packages/*/l10n/` folders.
7. Run `make l10n-write` to write the translations\
This command will use translations pulled in previous step and writes them to the `/packages/*/l10n/translations.json` files.
8. Run `./dev/scripts/bump_versions.sh $major.$minor.$patch`.\
This script will bump the `package.json` files in all relevant packages and the sonar cloud project version\
Replace the `$major`, `$minor` and `$patch` with the new version.
9. Commit and push your changes.
10. Create a PR with tag `[full-ci]` in the title at the beginning to merge the `chore/bump-version-$major.$minor.$patch` branch into the latest `stable-$major` branch
11. After merging, checkout the latest `stable-$major` branch again
12. Run `./dev/scripts/create_and_push_tags.sh`\
This script will create and push tags for the main app as well as all packages that need to be released
13. The GitHub release will be created automatically together with the release artifacts

#### Backporting Bug/Security Fixes Into Older Versions

1. Checkout the target `stable-$major` branch\
This branch will be used as the base for the new minor version branch.\
Replace `$major` with the target released major version.
2. Create a new branch `stable-$major.$minor`.\
Replace the `$major` and `$minor` with the new version.
3. Push the newly created `stable-$major.$minor` branch
4. Create a new branch `chore/bump-version-$major.$minor.$patch` using the branch from previous step as base\
Replace the `$major`, `$minor` and `$patch` with the new version.
5. Cherry pick all required changes from `master` into the current branch
6. Create a new sub-folder in the `/changelog/` folder using the release version and current date `mkdir $major.$minor.$patch_$YYYY-MM-DD`\
Replace the `$major`, `$minor` and `$patch` with the new version and `$YYYY-MM-DD` with the current date in the format `YYYY-MM-DD`.
7. Move all changelog items from the `/changelog/unreleased/` folder into the `$major.$minor.$patch_$YYYY-MM-DD` folder created in previous step
8. Run `make l10n-pull` to pull the translations\
This command will pull the latest translations from Transifex into the current branch and saves them in the `/packages/*/l10n/` folders.
9. Run `make l10n-write` to write the translations\
This command will use translations pulled in previous step and writes them to the `/packages/*/l10n/translations.json` files.
10. Run `./dev/scripts/bump_versions.sh $major.$minor.$patch`.\
This script will bump the `package.json` files in all relevant packages and the sonar cloud project version\
Replace `$major`, `$minor` and `$patch` with the new version.
11. Commit and push your changes.
12. Create a PR with tag `[full-ci]` in the title at the beginning to merge the `chore/bump-version-$major.$minor.$patch` branch into the new `stable-$major.$minor` branch
13. After merging, checkout the new `stable-$major.$minor` branch again
14. Run `./dev/scripts/create_and_push_tags.sh`\
This script will create and push tags for the main app as well as all packages that need to be released
15. The GitHub release will be created automatically together with the release artifacts

### Update Web in oCIS

1. In the [oCIS repository](https://github.com/owncloud/ocis), checkout the `master` branch
2. Create a new branch `chore/bump-web-to-$major.$minor.$patch`\
Replace `$major`, `$minor` and `$patch` with the released Web version.
3. In `.drone.env`, update `WEB_COMMITID` to the commit id of the Web release tag
4. In `.drone.env`, update `WEB_BRANCH` to the Web release stable branch
5. In `services/web/Makefile`, update `WEB_ASSETS_VERSION` to the Web release version
6. Add a new `enhancement` changelog item into the `/changelog/unreleased/` folder with the changelog from the Web release and link to the GitHub release
7. Commit and push your changes
8. Create a PR with tag `[full-ci]` in the title at the beginning to merge the `chore/bump-web-to-$major.$minor.$patch` branch into the master branch
