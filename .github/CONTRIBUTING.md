## Submitting issues

If you have questions about how to install or use ownCloud, please direct these to our [forum][forum].
For getting in touch with the developers, join our public [RocketChat][rocketchat].

### Short version

 * Submit your issue to our [issue tracker][tracker], but be aware of the different repositories. See the list below. Please always use the issue template when reporting issues.

### Guidelines
* Please search the existing issues first, it's likely that your issue was already reported or even fixed.
  - Go to one of the repositories, click "issues" and type any word in the top search/command bar.
  - You can also filter by appending e.g. "state:open" to the search string.
  - More info on [search syntax within github](https://help.github.com/articles/searching-issues)
* __SECURITY__: Report any potential security bug to us via [our HackerOne page](https://hackerone.com/owncloud) or security@owncloud.com following our [security policy](https://owncloud.org/security/) instead of filing an issue in our bug tracker
* This repository ([web](https://github.com/owncloud/web/issues)) is *only* for issues within the Web code.
* The issues in other components should be reported in their respective repositories: 
  - [ownCloud Classic](https://github.com/owncloud/core/issues)
  - [ownCloud Infinite Scale](https://github.com/owncloud/ocis/issues)
  - [Android client](https://github.com/owncloud/android/issues)
  - [iOS client](https://github.com/owncloud/ios-app)
  - [Desktop client](https://github.com/owncloud/client/issues)
  - [Documentation](https://github.com/owncloud/docs/issues)
  - [ownCloud apps](https://github.com/owncloud/core/wiki/Apps)
* Submit your issue to our [issue tracker][tracker]. Please stick to our issue template, it includes all the information we need to track down the issue.

Help us to maximize the effort we can spend fixing issues and adding new features, by not reporting duplicate issues.

[tracker]: https://github.com/owncloud/web/issues/new
[forum]: https://central.owncloud.org/
[rocketchat]: https://talk.owncloud.com/channel/web

## Contributing to Source Code

Thanks for wanting to contribute source code to ownCloud. That's great!

Before we're able to merge your code, you need to sign our [Contributor Agreement][agreement]. You can sign it digitally as soon as you open your first pull request.

Please read the [Developer Documentation][devmanual] to learn how to use our extension system or how to run tests for your features.

In order to constantly increase the quality of our software we can no longer accept pull requests which submit un-tested code.
We have the goal that code segments are unit tested. Please try to help us with that goal. In some areas unit testing is hard 
(aka almost impossible) as of today - in these areas refactoring WHILE fixing a bug is encouraged to enable unit testing.

[agreement]: https://owncloud.com/contribute/join-the-development/contributor-agreement/
[devmanual]: https://owncloud.dev/clients/web/

## Translations
Please submit translations via [Transifex][transifex].

[transifex]: https://www.transifex.com/projects/p/owncloud-web/
