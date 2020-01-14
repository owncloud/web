Changelog for ownCloud Phoenix [0.2.7] (2020-01-14)
=======================================
The following sections list the changes in ownCloud phoenix 0.2.7 relevant to
ownCloud admins and users.

[0.2.7]: https://github.com/owncloud/phoenix/compare/v0.2.6...v0.2.7

Summary
-------

* Bugfix - Display files list only if there is at least one item: [#2745](https://github.com/owncloud/phoenix/issues/2745)
* Bugfix - Register store which is imported instead of required: [#2837](https://github.com/owncloud/phoenix/issues/2837)
* Enhancement - Internal links in app switcher: [#2838](https://github.com/owncloud/phoenix/issues/2838)

Details
-------

* Bugfix - Display files list only if there is at least one item: [#2745](https://github.com/owncloud/phoenix/issues/2745)

   Vue virtual scroll was throwing an error in console in case that the files list was empty. We
   prevent this error by displaying the files list only if there is at least one item.

   https://github.com/owncloud/phoenix/issues/2745

* Bugfix - Register store which is imported instead of required: [#2837](https://github.com/owncloud/phoenix/issues/2837)

   As some extensions export store not as a module we need to handle that case as well.

   https://github.com/owncloud/phoenix/issues/2837

* Enhancement - Internal links in app switcher: [#2838](https://github.com/owncloud/phoenix/issues/2838)

   In case extensions integrates itself into Phonix core and not as own SPA we need to handle the
   navigation via router-link inside of Phoenix core SPA.

   https://github.com/owncloud/phoenix/issues/2838

## [0.2.6]
### Added
- Skip to component, id attribute for <main> https://github.com/owncloud/phoenix/pull/2326
- Focus management regarding off canvas main nav https://github.com/owncloud/phoenix/pull/2101
- Publish docker on tag https://github.com/owncloud/phoenix/pull/2485
- New collaborators flow https://github.com/owncloud/phoenix/pull/2450
- Hide quota on external storage https://github.com/owncloud/phoenix/pull/2652
- Focus management for uploads https://github.com/owncloud/phoenix/pull/2542
- File actions can be defined using config settings https://github.com/owncloud/phoenix/pull/2651
- Files table virtual scroller https://github.com/owncloud/phoenix/pull/2280
- Virtual scroll in trash bin https://github.com/owncloud/phoenix/pull/2809

### Fixed
- Wrong method for copy action of public link https://github.com/owncloud/phoenix/pull/2363
- Token refresh flow https://github.com/owncloud/phoenix/pull/2472
- App tar balls need to contain top level folder named like the app itself https://github.com/owncloud/phoenix/pull/2449
- Scroll behavior on mozilla firefox https://github.com/owncloud/phoenix/pull/2475
- Steps order on release/publish https://github.com/owncloud/phoenix/pull/2491
- Don't re-filter autocomplete collaborators results for remote user https://github.com/owncloud/phoenix/pull/2569
- Limit concurrent uploads to one https://github.com/owncloud/phoenix/pull/2653
- Extend share id check in public links https://github.com/owncloud/phoenix/pull/2494
- Made the trashbin table responsive https://github.com/owncloud/phoenix/pull/2287
- Hide checkbox label in files list https://github.com/owncloud/phoenix/pull/2680
- Share flow accessibility https://github.com/owncloud/phoenix/pull/2622
- Remove empty parentheses in shared with others list https://github.com/owncloud/phoenix/pull/2725
- Do not hide collaborator if another entry with the same name exists if they are not the same type https://github.com/owncloud/phoenix/pull/2724
- Display breadcrumb if rootFolder is set with no value https://github.com/owncloud/phoenix/pull/2811
- Include avatar placeholder in relevant places https://github.com/owncloud/phoenix/pull/2783

### Changed
- Decouple base file list into a separate component https://github.com/owncloud/phoenix/pull/2318
- Switched the storage of the auth service from local to session storage https://github.com/owncloud/phoenix/pull/2416
- Don't build the docker image in the release make file https://github.com/owncloud/phoenix/pull/2495
- Use owncloud-sdk for uploading files https://github.com/owncloud/phoenix/pull/2239
- Refactor collaborators to use helper classes and to map permissions https://github.com/owncloud/phoenix/pull/2373
- Moved private link icon to "links" section https://github.com/owncloud/phoenix/pull/2496
- Separate app switcher from app navigation sidebar https://github.com/owncloud/phoenix/pull/2669

## [0.2.5]
### Added
- IE11 support https://github.com/owncloud/phoenix/pull/2082
- Draw.io app integration https://github.com/owncloud/phoenix/pull/2083
- New file menu entries for different file types https://github.com/owncloud/phoenix/pull/2111
- Drone starlark https://github.com/owncloud/phoenix/pull/2112
- Rename and delete will be disallowed in case the parent folder has no permissions fot these two operations https://github.com/owncloud/phoenix/pull/2129
- Progress bar for upload https://github.com/owncloud/phoenix/pull/2176
- Handle errors while deleting and renaming files https://github.com/owncloud/phoenix/pull/2177
- Logout option on access denied page https://github.com/owncloud/phoenix/pull/2178
- Download feedback spinner https://github.com/owncloud/phoenix/pull/2179
- Remove rootFolder from breadcrumbs https://github.com/owncloud/phoenix/pull/2196
- Send header X-Requested-With: XMLHttpRequest in all requests https://github.com/owncloud/phoenix/pull/2197
- X-Frame-Options and Content-Security-Policy https://github.com/owncloud/phoenix/pull/2311

### Fixed
- IE11 support for media viewer app https://github.com/owncloud/phoenix/pull/2086
- Files drop when link password is set https://github.com/owncloud/phoenix/pull/2096
- Detection of public pages despite existing auth https://github.com/owncloud/phoenix/pull/2097
- Public link access in incognito mode https://github.com/owncloud/phoenix/pull/2110
- Password handling in public links https://github.com/owncloud/phoenix/pull/2117
- More close options to file actions menu https://github.com/owncloud/phoenix/pull/2161
- Reset search value on clear action https://github.com/owncloud/phoenix/pull/2198
- Prevent duplicate token refresh calls https://github.com/owncloud/phoenix/pull/2205
- Use PQueue to run only one create folder promise in folder upload https://github.com/owncloud/phoenix/pull/2210
- Upon token refresh do not perform full login on sdk level https://github.com/owncloud/phoenix/pull/2211
- Exit link on access denied page https://github.com/owncloud/phoenix/pull/2220
- Structure of folders in folder upload https://github.com/owncloud/phoenix/pull/2224
- Remove file from progress after download on IE11 https://github.com/owncloud/phoenix/pull/2310
- Properly reset capabilities on logout https://github.com/owncloud/phoenix/pull/2116

### Changed
- For mounted folders use the full url as private link https://github.com/owncloud/phoenix/pull/2170
- Store route in vuex before login in case user is unauthorized https://github.com/owncloud/phoenix/pull/2170
- Use currentFolder path in breadcrumbs https://github.com/owncloud/phoenix/pull/2196
- Switch to show instead of if in upload progress bar https://github.com/owncloud/phoenix/pull/2206
- Key of file action buttons to ariaLabel https://github.com/owncloud/phoenix/pull/2219
- Trigger add to progress before the folders creation https://github.com/owncloud/phoenix/pull/2221
- Handle remove from progress in its own mutation https://github.com/owncloud/phoenix/pull/2225
- Use oidc-client 1.9.1 https://github.com/owncloud/phoenix/pull/2261

### Security
- Added sanitization to markdown editor app https://github.com/owncloud/phoenix/pull/2233

### Removed
- Drag and drop in ie11 because of compatibility issues https://github.com/owncloud/phoenix/pull/2128

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
- Set X-Requested-With header - required ownCloud 10.3 https://github.com/owncloud/phoenix/pull/1984
- Use 2 spaces instead of tab for feature files https://github.com/owncloud/phoenix/pull/2004
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
