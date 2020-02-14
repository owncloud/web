Changelog for ownCloud Phoenix [0.4.0] (2020-02-14)
=======================================
The following sections list the changes in ownCloud phoenix 0.4.0 relevant to
ownCloud admins and users.

[0.4.0]: https://github.com/owncloud/phoenix/compare/v0.3.0...v0.4.0

Summary
-------

* Bugfix - Fix collaborator selection on new collaborator shares: [#1186](https://github.com/owncloud/phoenix/issues/1186)
* Bugfix - Prevent loader in sidebar on add/remove: [#2937](https://github.com/owncloud/phoenix/issues/2937)
* Bugfix - Fix issue with translate function for pending shares: [#3012](https://github.com/owncloud/phoenix/issues/3012)
* Bugfix - Properly manage escaping of all translations: [#3032](https://github.com/owncloud/phoenix/pull/3032)
* Change - Improve UI/UX of collaborator forms: [#1186](https://github.com/owncloud/phoenix/issues/1186)
* Change - Display only items for current extension in sidebar menu: [#2746](https://github.com/owncloud/phoenix/issues/2746)
* Change - Removed filter button in files list header: [#2971](https://github.com/owncloud/phoenix/issues/2971)
* Change - File actions now always behind three dots button: [#2974](https://github.com/owncloud/phoenix/pull/2974)
* Change - Improve ownCloud Design System (ODS): [#2989](https://github.com/owncloud/phoenix/issues/2989)
* Change - Improve visual appearance of upload progress: [#3742](https://github.com/owncloud/enterprise/issues/3742)
* Enhancement - Add empty folder message in file list views: [#1910](https://github.com/owncloud/phoenix/issues/1910)
* Enhancement - Fixed header for files tables: [#1952](https://github.com/owncloud/phoenix/issues/1952)

Details
-------

* Bugfix - Fix collaborator selection on new collaborator shares: [#1186](https://github.com/owncloud/phoenix/issues/1186)

   When typing text into the search box for new collaborators, selecting a user and a group with
   identical names was not possible. This was due to the fact that when one (group or user) got
   selected, the other was excluded because of a matching name. Fixed by including the share type
   (group or user) in matching.

   https://github.com/owncloud/phoenix/issues/1186

* Bugfix - Prevent loader in sidebar on add/remove: [#2937](https://github.com/owncloud/phoenix/issues/2937)

   When adding or removing a public link or collaborator, the respective list view sidebar panels
   briefly hid the panel and showed a loader instead. The UI is supposed to show a visual transition
   of a new list item into the list on adding, as well as a visual transition out of the list on
   deletion. This is fixed now by not triggering the loading state on add and remove actions
   anymore. A loading state is only meant to appear when the user navigates to the shares of another
   file/folder.

   https://github.com/owncloud/phoenix/issues/2937
   https://github.com/owncloud/phoenix/pull/2952

* Bugfix - Fix issue with translate function for pending shares: [#3012](https://github.com/owncloud/phoenix/issues/3012)

   The pending shares was wrongly passing in a translation function, which caused translations
   to be missing in the error message but also it broke the general translation sync process with
   Transifex. Thanks to this change the translations will be up to date again.

   https://github.com/owncloud/phoenix/issues/3012
   https://github.com/owncloud/phoenix/pull/3014

* Bugfix - Properly manage escaping of all translations: [#3032](https://github.com/owncloud/phoenix/pull/3032)

   We've stopped escaping translations which contained resource names or user names because
   they can contain special characters which were then not properly displayed. We've done this
   only with translations which are using mustache syntax which does escaping on its own so we
   don't introduce poteintial XSS vulnerability. For all other translations, we've explicitly
   set the escaping.

   https://github.com/owncloud/phoenix/pull/3032

* Change - Improve UI/UX of collaborator forms: [#1186](https://github.com/owncloud/phoenix/issues/1186)

   Applied several UI/UX improvements to the collaborator forms (adding and editing). - Showing
   avatars for selected collaborators on a new share and fixed styling/layouting of said
   collaborators in the list. - Added sensible margins on text about missing permissions for
   re-sharing in the sharing sidebar. - Fixed alignment of displayed collaborator in editing
   view for collaborators. - Removed separators from the forms that were cluttering the view. -
   Moved role description on role selection (links and collaborators) into the form element. Not
   shown below the form element anymore.

   https://github.com/owncloud/phoenix/issues/1186

* Change - Display only items for current extension in sidebar menu: [#2746](https://github.com/owncloud/phoenix/issues/2746)

   We've filtered out nav items in the sidebar menu. Now only items for current extension will be
   displayed. In case the extension has only one nav item, the sidebar menu is hidden and instead of
   menu button is displayed the name of extension.

   https://github.com/owncloud/phoenix/issues/2746
   https://github.com/owncloud/phoenix/pull/3013

* Change - Removed filter button in files list header: [#2971](https://github.com/owncloud/phoenix/issues/2971)

   Removed the confusing filter button in the files list header, so the following are now removed
   as well: - ability to toggle files and folders visibility which wasn't that useful and not
   really a requirement - filter text box as it is is redundant as one can already use the global
   search box - ability to hide dot files, we'll look into providing this again in the future with an
   improved UI

   https://github.com/owncloud/phoenix/issues/2971

* Change - File actions now always behind three dots button: [#2974](https://github.com/owncloud/phoenix/pull/2974)

   The inline file actions button didn't look very nice and made the UI look cluttered. This change
   hides them behind a three dots button on the line, the same that was already visible in
   responsive mode. The three dots button also now has no more border and looks nicer.

   https://github.com/owncloud/phoenix/pull/2974

* Change - Improve ownCloud Design System (ODS): [#2989](https://github.com/owncloud/phoenix/issues/2989)

   During the work on this release, there have been several changes in ODS which directly affect
   Phoenix. - Proper text truncate in breadcrumb component. This fixes the mobile view of the
   current folder breadcrumb in the top bar. - New icon sizes `xlarge` and `xxlarge` in oc-icon
   component. Those are used for the `No content` messages e.g. when navigating to an empty
   folder. - Provide new icon size `xsmall` and align spinner-sizes with icon-sizes. The
   `xsmall` icon size turned out to be prettier in some places. The size alignments fixed layout
   glitches when removing collaborators or public links. - Fix aria label on spinner in
   oc-autocomplete. Warning were cluttering the JavaScript console when adding
   collaborators. - Reset input on selection in oc-autocomplete, when
   `fillOnSelection=false`. This makes sure that when a new collaborator has been selected, the
   search input field goes back to being blank for a new search.

   https://github.com/owncloud/phoenix/issues/2989
   https://github.com/owncloud/owncloud-design-system/pull/630
   https://github.com/owncloud/owncloud-design-system/pull/632
   https://github.com/owncloud/owncloud-design-system/pull/633
   https://github.com/owncloud/owncloud-design-system/pull/634
   https://github.com/owncloud/owncloud-design-system/pull/635

* Change - Improve visual appearance of upload progress: [#3742](https://github.com/owncloud/enterprise/issues/3742)

   - Changed the layout of the upload progress to be a narrow standalone full width row below the app
   top bar. - Transformed textual information into a single row below the progress bar and made it
   very clear that it can be clicked to show upload progress details. - Changed layout of upload
   progress details list items, so that the progress bars always have the same width. - Changed
   visuals of all progress bars in upload context to have a narrow outline and the percentage
   numbers inside of the progress bars. - Fixed the calculation of the overall upload progress to
   be weighted by file sizes instead of just adding up percentages and dividing by number of
   uploads.

   https://github.com/owncloud/enterprise/issues/3742

* Enhancement - Add empty folder message in file list views: [#1910](https://github.com/owncloud/phoenix/issues/1910)

   Whenever a folder contains no entries in any of the file list views, a message is now shown
   indicating that the folder is empty, or that there are no favorites, etc.

   https://github.com/owncloud/phoenix/issues/1910
   https://github.com/owncloud/phoenix/pull/2975

* Enhancement - Fixed header for files tables: [#1952](https://github.com/owncloud/phoenix/issues/1952)

   We've made the header of files tables fixed so it is easier to know the meaning of table columns.

   https://github.com/owncloud/phoenix/issues/1952
   https://github.com/owncloud/phoenix/pull/2995

Changelog for ownCloud Phoenix [0.3.0] (2020-01-31)
=======================================
The following sections list the changes in ownCloud phoenix 0.3.0 relevant to
ownCloud admins and users.

[0.3.0]: https://github.com/owncloud/phoenix/compare/v0.2.7...v0.3.0

Summary
-------

* Bugfix - Transform route titles into real h1 headings: [#2681](https://github.com/owncloud/phoenix/pull/2681)
* Bugfix - Prevent jumpy behavior when loading user avatars: [#2921](https://github.com/owncloud/phoenix/issues/2921)
* Change - Bring UI/UX of file links sidebar in line with sharing sidebar: [#1907](https://github.com/owncloud/phoenix/issues/1907)
* Change - Join users and groups into a single list in collaborators sidebar: [#2900](https://github.com/owncloud/phoenix/issues/2900)
* Change - Adjusted labels in files list: [#2902](https://github.com/owncloud/phoenix/pull/2902)
* Enhancement - Add share indicator for direct and indirect shares in file list: [#2060](https://github.com/owncloud/phoenix/issues/2060)
* Enhancement - Add files list status indicators extension point: [#2895](https://github.com/owncloud/phoenix/issues/2895)
* Enhancement - Add theme option to disable default files list status indicators: [#2895](https://github.com/owncloud/phoenix/issues/2895)
* Enhancement - Show indirect outgoing shares in shares panel: [#2897](https://github.com/owncloud/phoenix/issues/2897)
* Enhancement - Add owner and resharer in collaborators list: [#2898](https://github.com/owncloud/phoenix/issues/2898)

Details
-------

* Bugfix - Transform route titles into real h1 headings: [#2681](https://github.com/owncloud/phoenix/pull/2681)

   We transformed spans that held the page title to h1 elements. In the case of the file list, a h1 is
   existing for accessibility reasons but can only be perceived via a screen reader.

   https://github.com/owncloud/phoenix/pull/2681

* Bugfix - Prevent jumpy behavior when loading user avatars: [#2921](https://github.com/owncloud/phoenix/issues/2921)

   When loading a user avatar, the container size was smaller so as soon as the avatar was loaded, it
   resulted in jumpy behavior. This is fixed now by applying the same size to the loading spinner
   element.

   https://github.com/owncloud/phoenix/issues/2921
   https://github.com/owncloud/phoenix/pull/2927

* Change - Bring UI/UX of file links sidebar in line with sharing sidebar: [#1907](https://github.com/owncloud/phoenix/issues/1907)

   We adapted the UI/UX of the file links sidebar to be in line with the UI/UX of the collaborators
   sidebar. The order of the two sidebars has been reversed (collaborators first, file links
   second). We added info messages to support a clear understanding of the purpose of both private
   and public links. Most notably the file links sidebar has no inline forms anymore.

   https://github.com/owncloud/phoenix/issues/1907
   https://github.com/owncloud/phoenix/issues/1307
   https://github.com/owncloud/phoenix/pull/2841
   https://github.com/owncloud/phoenix/pull/2917

* Change - Join users and groups into a single list in collaborators sidebar: [#2900](https://github.com/owncloud/phoenix/issues/2900)

   Users and groups were shown as two separate lists (users, then groups) in the collaborators
   sidebar. This separation is now removed, i.e. there is only one list with all collaborators,
   sorted by display name (lower case, ascending). On equal names groups are shown first.

   https://github.com/owncloud/phoenix/issues/2900

* Change - Adjusted labels in files list: [#2902](https://github.com/owncloud/phoenix/pull/2902)

   Renamed "Modification time" to "Updated" to make it look less technical. Replace "Create new"
   with "New" in the "New" menu as it makes it look less cluttered when trying to spot a matching
   entry.

   https://github.com/owncloud/phoenix/pull/2902
   https://github.com/owncloud/phoenix/pull/2905

* Enhancement - Add share indicator for direct and indirect shares in file list: [#2060](https://github.com/owncloud/phoenix/issues/2060)

   We've added the ability for the user to directly see whether a resource is shared in the file
   list. For this, share indicators in the form of a group icon and link icon will appear in a new
   column near the shared resource. The blue color of an icon tells whether outgoing shares exist
   directly on the resource. The grey color of an icon tells that incoming or outgoing shares exist
   on any of the parent folders.

   https://github.com/owncloud/phoenix/issues/2060
   https://github.com/owncloud/phoenix/issues/2894
   https://github.com/owncloud/phoenix/pull/2877

* Enhancement - Add files list status indicators extension point: [#2895](https://github.com/owncloud/phoenix/issues/2895)

   We've added the ability for the extension to inject custom status indicator into files list.
   New indicators will then appear next to the default one.

   https://github.com/owncloud/phoenix/issues/2895
   https://github.com/owncloud/phoenix/pull/2928

* Enhancement - Add theme option to disable default files list status indicators: [#2895](https://github.com/owncloud/phoenix/issues/2895)

   We've added the option into the theme to disable default files list status indicators.

   https://github.com/owncloud/phoenix/issues/2895
   https://github.com/owncloud/phoenix/pull/2928

* Enhancement - Show indirect outgoing shares in shares panel: [#2897](https://github.com/owncloud/phoenix/issues/2897)

   Whenever outgoing shares exist on any parent resource from the currently viewed resource, the
   shares panel will now show these outgoing shares with a link to jump to the matching parent
   resource. This applies to both indirect collaborators shares and also to indirect public link
   shares.

   https://github.com/owncloud/phoenix/issues/2897
   https://github.com/owncloud/phoenix/pull/2929
   https://github.com/owncloud/phoenix/pull/2932

* Enhancement - Add owner and resharer in collaborators list: [#2898](https://github.com/owncloud/phoenix/issues/2898)

   The top of the collaborators list now display new entries for the resource owner and the
   resharer when applicable, and also visible when viewing a child resource of a shared folder
   (indirect share).

   https://github.com/owncloud/phoenix/issues/2898
   https://github.com/owncloud/phoenix/pull/2915
   https://github.com/owncloud/phoenix/pull/2918

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
