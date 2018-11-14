## Submitting issues

If you have questions about how to install or use ownCloud, please direct these to our [forum][forum]. We are also available on our [RocketChat][rocketchat].

### Short version

 * The [**issue template can be found here**][template] but be aware of the different repositories! See list below. Please always use the issue template when reporting issues.

### Guidelines
* Please search the existing issues first, it's likely that your issue was already reported or even fixed.
  - Go to one of the repositories, click "issues" and type any word in the top search/command bar.
  - You can also filter by appending e. g. "state:open" to the search string.
  - More info on [search syntax within github](https://help.github.com/articles/searching-issues)
* This repository ([phoenix](https://github.com/owncloud/phoenix/issues)) is *only* for issues within the ownCloud Phoenix code.
* __SECURITY__: Report any potential security bug to us via [our HackerOne page](https://hackerone.com/owncloud) or security@owncloud.com following our [security policy](https://owncloud.org/security/) instead of filing an issue in our bug tracker
* The issues in other components should be reported in their respective repositories: 
  - [Server core](https://github.com/owncloud/core/issues)
  - [Android client](https://github.com/owncloud/android/issues)
  - [iOS client](https://github.com/owncloud/ios/issues)
  - [Desktop client](https://github.com/owncloud/client/issues)
  - [Documentation](https://github.com/owncloud/documentation/issues)
  - [ownCloud apps](https://github.com/owncloud/core/wiki/Maintainers#apps-repo)

* Report the issue using our [template][template], it includes all the information we need to track down the issue.

Help us to maximize the effort we can spend fixing issues and adding new features, by not reporting duplicate issues.

[template]: https://raw.github.com/owncloud/phoenix/master/.github/issue_template.md
[forum]: https://central.owncloud.org/
[rocketchat]: https://talk.owncloud.com/channel/phoenix

## Contributing to Source Code

Thanks for wanting to contribute source code to ownCloud. That's great!

Before we're able to merge your code into the ownCloud core, you need to sign our [Contributor Agreement][agreement]. You can sign it digitally as soon as you open your first pull request.

Please read the [Developer Manuals][devmanual] to learn how to create your first application or how to test the ownCloud code with PHPUnit.

In order to constantly increase the quality of our software we can no longer accept pull request which submit un-tested code.
It is a must have that changed and added code segments are unit tested.
In some areas unit testing is hard (aka almost impossible) as of today - in these areas refactoring WHILE fixing a bug is encouraged to enable unit testing.

[agreement]: https://owncloud.org/about/contributor-agreement/
[devmanual]: https://owncloud.org/dev

## Translations
Please submit translations via [Transifex][transifex].

[transifex]: https://www.transifex.com/projects/p/owncloud/
