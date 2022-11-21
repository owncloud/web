### This is a quick overview on how versioning is done inside the ownCloud Design System and a step-by-step guide on publishing new versions

You’re looking at ownCloud Design System’s versioning and release section. Everything you see here is editable in Markdown format. To change or remove this content, see [/docs/versioning-and-release.md](https://github.com/owncloud/owncloud-design-system/blob/master/docs/versioning-and-release.md).

## Versioning

Within the ownCloud Design System, we follow the [Semantic Versioning](https://semver.org/) scheme. Therefore, each change is of one of the possible types: `Bugfix, Change, Enhancement, Security`. 

The highest type before a new release determines the version update number, so if it's only `Bugfix` and `Security` changes the next release will be a `PATCH` version bump, if there's at least one `Enhancement` within the changes this leads to a `MINOR` version bump, while `Change` type changes make for a new `MAJOR` release version.

## Release Guide

1.  Create a branch release-$version in https://github.com/owncloud/owncloud-design-system.
2.  Create a folder in `changelog/` for the release version and date: `mkdir changelog/$major.$minor.$patchVersion_YYYY-MM-DD`.
3.  Move all changelog items from the `changelog/unreleased/` folder to the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
4.  Update the version in `package.json` and `sonar-project.properties`
5.  Update `released in` and `status` fields of components (see `oC Components` docs for an easy overview)  
6.  Make sure [the translations](https://www.transifex.com/owncloud-org/owncloud/owncloud-design-system/) are up to date. If not, reach out to one of the repo maintainers
7.  Commit your changes, push and create a pull request to the `master` branch of the owncloud-design-system
8.  After merging, wait for the CI to run on the merge commit.
9.  Go to the [new Releases section](https://github.com/owncloud/owncloud-design-system/releases/new) in the https://github.com/owncloud/owncloud-design-system repo.
10.  Use v$major.$minor.$patch as a tag (the v prefix is important) and $major.$minor.$patch as a title (leave description and attachments empty since the CI is taking care of that). Depending on whether this release should show up on the main page of repository, you can mark it as a `pre-release` using the checkbox at the bottom. Once you're done, hit the **Publish release** button to trigger the relase.
11.  The tag and the Release artifacts will be created automatically. Once this has finished, the new version is published an can be downloaded via NPM.
