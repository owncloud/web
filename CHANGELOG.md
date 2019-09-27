# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## [0.2.4]
### Added
- Private link for the current folder to the app bar https://github.com/owncloud/phoenix/pull/2009

### Fixed
- Clear state in case of error in authorisation https://github.com/owncloud/phoenix/pull/2079
- Hide comma before mdate if there is no size https://github.com/owncloud/phoenix/pull/2073
- Don't perform OIDC logout in case of error in authorisation https://github.com/owncloud/phoenix/pull/2072


### Changed
- Use sharetype keys that are human readable instead of number https://github.com/owncloud/phoenix/pull/2071

## [0.2.3]
### Added
- Acceptance tests for public links https://github.com/owncloud/phoenix/pull/1886
- Set X-Requested-With header - required ownCloud 10.3 https://github.com/owncloud/phoenix/pull/1984
- Use 2 spaces instead of tab for feature files https://github.com/owncloud/phoenix/pull/2004
- Test sharing a file via public link https://github.com/owncloud/phoenix/pull/1981
- Handle OAuth/OpenIdConnect error in callback request query string https://github.com/owncloud/phoenix/pull/2011
- Enable loading apps from external sites https://github.com/owncloud/phoenix/pull/1986
- Add default client side sort https://github.com/owncloud/phoenix/pull/1972

### Fixed
- Public link permissions mix up https://github.com/owncloud/phoenix/pull/1985
- Downgrade vuex-persist to 2.0.1 to fix IE11 issues https://github.com/owncloud/phoenix/pull/2007

## [0.2.2]
### Added
- Show error message when user tries to upload a folder in IE11 https://github.com/owncloud/phoenix/pull/1956
- Error message if the folder or file name is empty in create dialog and added default value https://github.com/owncloud/phoenix/pull/1938
- Bookmarks to menu https://github.com/owncloud/phoenix/pull/1949
- Collaborators test for changing share permissions https://github.com/owncloud/phoenix/pull/1838

### Fixed
- Redirect to access denied page if the user doesn't have access to Phoenix instance https://github.com/owncloud/phoenix/pull/1939
- Redirect to private link after user has logged in https://github.com/owncloud/phoenix/pull/1900
- Breaking of link to help desk on new line https://github.com/owncloud/phoenix/pull/1940

## [0.2.1]
### Added
- Download feedback https://github.com/owncloud/phoenix/pull/1895

### Fixed
- Download of files shared with password-protected public links https://github.com/owncloud/phoenix/issues/1808
- Search button on mobile devices https://github.com/owncloud/phoenix/pull/1893
- Collapsing of alert messages after they have been closed https://github.com/owncloud/phoenix/pull/1881

## [0.2.0]
### Added
- Collaborators (replacement for shares)
- Public and private links
- Shared with me and Shared with others lists
- Favorites page
- Trash bin page

## [0.1.0]
### Added
- Initial early alpha release

[Unreleased]: https://github.com/owncloud/phoenix/compare/0.1.0...master
[0.1.0]: https://github.com/owncloud/phoenix/compare/d1cfc2d5f82202ac30c91e903e4810f42650c183...0.1.0

