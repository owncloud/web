Changelog for ownCloud Web [unreleased] (UNRELEASED)
=======================================
The following sections list the changes in ownCloud web unreleased relevant to
ownCloud admins and users.

[unreleased]: https://github.com/owncloud/web/compare/v3.1.0...master

Summary
-------

* Bugfix - Correct navigation through "via"-tags: [#5122](https://github.com/owncloud/web/pull/5122)
* Bugfix - Correct sharee tag: [#5112](https://github.com/owncloud/web/pull/5112)

Details
-------

* Bugfix - Correct navigation through "via"-tags: [#5122](https://github.com/owncloud/web/pull/5122)

   The "shared via X" link in the indirect share tag in the sidebar was navigating to the parent
   directory of the indirect share entry. This has been fixed for the collaborators sidebar
   section and the link target is the share entry itself now.

   https://github.com/owncloud/web/pull/5122

* Bugfix - Correct sharee tag: [#5112](https://github.com/owncloud/web/pull/5112)

   The tag _inside_ a shared folder always announced the current user as "owner", since the shares
   lookup didn't check for the parent folders' ownership. This has been fixed now and users get the
   correct tag (e.g. "Viewer", "Editor" etc) in the sidebar.

   https://github.com/owncloud/web/pull/5112

Changelog for ownCloud Web [3.1.0] (2021-05-12)
=======================================
The following sections list the changes in ownCloud web 3.1.0 relevant to
ownCloud admins and users.

[3.1.0]: https://github.com/owncloud/web/compare/v3.0.0...v3.1.0

Summary
-------

* Bugfix - Editors for all routes: [#5095](https://github.com/owncloud/web/pull/5095)
* Bugfix - Improve web container: [#4942](https://github.com/owncloud/web/pull/4942)
* Bugfix - Display navigation for resolved private link: [#5023](https://github.com/owncloud/web/pull/5023)
* Bugfix - Fix z-index on the new file menu: [#5056](https://github.com/owncloud/web/pull/5056)
* Enhancement - Accessibility improvements: [#4965](https://github.com/owncloud/web/pull/4965)
* Enhancement - Implement proper direct delete: [#4991](https://github.com/owncloud/web/pull/4991)
* Enhancement - Enable files app search bar to be toggleable on a per-route basis: [#4815](https://github.com/owncloud/web/pull/4815)
* Enhancement - Extension config: [#5024](https://github.com/owncloud/web/pull/5024)
* Enhancement - Focus management: [#4993](https://github.com/owncloud/web/pull/4993)
* Enhancement - Align headline hierarchy: [#5003](https://github.com/owncloud/web/issues/5003)
* Enhancement - Lazy file avatar loading: [#5073](https://github.com/owncloud/web/pull/5073)
* Enhancement - Use list for displaying added people: [#4915](https://github.com/owncloud/web/pull/4915)
* Enhancement - Use real page title for location picker: [#5009](https://github.com/owncloud/web/pull/5009)
* Enhancement - Show search button in search bar: [#4985](https://github.com/owncloud/web/pull/4985)

Details
-------

* Bugfix - Editors for all routes: [#5095](https://github.com/owncloud/web/pull/5095)

   If an extension doesn't define valid routes it should be allowed for all routes by default. That
   behaviour was not working properly and is fixed now.

   https://github.com/owncloud/web/pull/5095

* Bugfix - Improve web container: [#4942](https://github.com/owncloud/web/pull/4942)

   The wrapping `index.html.ejs` had some minor problems with HTML validators which are now
   fixed.

   https://github.com/owncloud/web/pull/4942

* Bugfix - Display navigation for resolved private link: [#5023](https://github.com/owncloud/web/pull/5023)

   We've fixed that the navigation in the left sidebar is visible for a resolved private link as
   well

   https://github.com/owncloud/web/pull/5023

* Bugfix - Fix z-index on the new file menu: [#5056](https://github.com/owncloud/web/pull/5056)

   Added a z-index to files-view because it prevented the new file menu from having a higher
   z-index than the table headers. As a result the new file menu was being overlapped by them.

   https://github.com/owncloud/web/pull/5056

* Enhancement - Accessibility improvements: [#4965](https://github.com/owncloud/web/pull/4965)

   A lot of random changes: - Extracted some helper classes to ODS & unified their usage - Removed
   `<br>` tags that were incorrectly used for spacing - Used `<h4>` tags for headings in the files
   sidebar - Make skip-to-main button translate-able - Update searchbar label string - Renamed
   "personal files" to "all files" in routes (soft rename, due to changes in the future) - Updated
   ODS to v6.0.3, making row heights theme-able and bringing a more accessible avatar component
   that improves loading of users' profile pictures

   https://github.com/owncloud/web/pull/4965
   https://github.com/owncloud/web/pull/4975
   https://github.com/owncloud/web/pull/5098

* Enhancement - Implement proper direct delete: [#4991](https://github.com/owncloud/web/pull/4991)

   We implemented a proper delete action for a single file instead of reusing the batch action for
   deleting multiple files. This also solves the issue with the checkbox being checked when
   opening the delete modal, which was not a11y compliant.

   https://github.com/owncloud/web/pull/4991

* Enhancement - Enable files app search bar to be toggleable on a per-route basis: [#4815](https://github.com/owncloud/web/pull/4815)

   Permits the search bar in the files app to be toggleable on a per-route basis as shown or hidden.

   https://github.com/owncloud/web/pull/4815

* Enhancement - Extension config: [#5024](https://github.com/owncloud/web/pull/5024)

   Loading extension specific config was only possible for file editors. We now also load it in the
   general app information, so that it's available in the `apps` getter of the global vuex store.

   https://github.com/owncloud/web/pull/5024

* Enhancement - Focus management: [#4993](https://github.com/owncloud/web/pull/4993)

   We added a mixin that makes it able to manage, record and reverse-replay the focus for the
   current document. The first components that using it are modal and sidebar in the files app.

   https://github.com/owncloud/web/issues/4992
   https://github.com/owncloud/web/pull/4993

* Enhancement - Align headline hierarchy: [#5003](https://github.com/owncloud/web/issues/5003)

   Streamlined headline tags so that pages have a h1 tag and the headline hierarchy is adhered.

   https://github.com/owncloud/web/issues/5003
   https://github.com/owncloud/web/pull/5004
   https://github.com/owncloud/web/pull/5005

* Enhancement - Lazy file avatar loading: [#5073](https://github.com/owncloud/web/pull/5073)

   We've changed the way how large file lists get rendered. In some cases where we had a long list of
   files, the loading of avatars could lead to long waiting times till the first paint happens.

   Now we first render the list of files, load the associated avatars in the background and then
   update the ui.

   https://github.com/owncloud/web/issues/4973
   https://github.com/owncloud/web/pull/5073

* Enhancement - Use list for displaying added people: [#4915](https://github.com/owncloud/web/pull/4915)

   We've changed the HTML elements in the people accordion when adding new people. People added
   via people autocomplete are now displayed in a list element to use correct structure for screen
   readers.

   https://github.com/owncloud/web/pull/4915

* Enhancement - Use real page title for location picker: [#5009](https://github.com/owncloud/web/pull/5009)

   We've added real page titles to the location picker. The title is consisted of the current
   action, target and product name.

   https://github.com/owncloud/web/pull/5009

* Enhancement - Show search button in search bar: [#4985](https://github.com/owncloud/web/pull/4985)

   https://github.com/owncloud/web/pull/4985

Changelog for ownCloud Web [3.0.0] (2021-04-21)
=======================================
The following sections list the changes in ownCloud web 3.0.0 relevant to
ownCloud admins and users.

[3.0.0]: https://github.com/owncloud/web/compare/v2.1.0...v3.0.0

Summary
-------

* Bugfix - Avatar url without double slash: [#4610](https://github.com/owncloud/web/issues/4610)
* Bugfix - Open mediaviewer for upper case file extensions: [#4647](https://github.com/owncloud/web/issues/4647)
* Bugfix - Only one `<main>` tag per HTML document: [#1652](https://github.com/owncloud/web/issues/1652)
* Bugfix - Parent paths traversal for shares: [#4860](https://github.com/owncloud/web/issues/4860)
* Change - Update owncloud Design System to v6.0.1: [#4940](https://github.com/owncloud/web/pull/4940)
* Change - New files list: [#4627](https://github.com/owncloud/web/pull/4627)
* Enhancement - A11y improvements for files app bar: [#4786](https://github.com/owncloud/web/issues/4786)
* Enhancement - Enable files app search bar to be toggleable on a per-route basis: [#4815](https://github.com/owncloud/web/pull/4815)
* Enhancement - Add web-pkg package: [#4907](https://github.com/owncloud/web/pull/4907)
* Enhancement - Implement live region updates on route changes: [#4812](https://github.com/owncloud/web/pull/4812)
* Enhancement - Use list for displaying added people: [#4915](https://github.com/owncloud/web/pull/4915)
* Enhancement - Runtime theming: [#4822](https://github.com/owncloud/web/pull/4822)
* Enhancement - Add "Shared via link" page: [#4881](https://github.com/owncloud/web/pull/4881)
* Enhancement - Use ODS translations: [#4934](https://github.com/owncloud/web/pull/4934)

Details
-------

* Bugfix - Avatar url without double slash: [#4610](https://github.com/owncloud/web/issues/4610)

   The avatar url added another superfluous slash after the instance url which resulted in the
   avatar not being able to load.

   https://github.com/owncloud/web/issues/4610
   https://github.com/owncloud/web/pull/4849

* Bugfix - Open mediaviewer for upper case file extensions: [#4647](https://github.com/owncloud/web/issues/4647)

   We fixed a bug where the mediaviewer didn't open for files which had an uppercase (or mixed case)
   file extension.

   https://github.com/owncloud/web/issues/4647
   https://github.com/owncloud/web/pull/4627

* Bugfix - Only one `<main>` tag per HTML document: [#1652](https://github.com/owncloud/web/issues/1652)

   Only one `<main>` tag is allowed per HTML document. This change removes the ones in
   `web-container` and `web-runtime` and adds one to each extension (files-list, mediaviewer,
   markdowneditor, drawio) since they can't be loaded at the same time.

   https://github.com/owncloud/web/issues/1652
   https://github.com/owncloud/web/pull/4627

* Bugfix - Parent paths traversal for shares: [#4860](https://github.com/owncloud/web/issues/4860)

   We fixed a bug in parent paths traversals for loading shares. A path with a trailing slash was
   twice in the result of (parent-)paths, leading to fetching the existing shares on the current
   folder twice. Since we fetch incoming and outgoing shares this caused 2 unnecessary requests
   on every page load that changed into a child folder or a folder unrelated to the current path.

   https://github.com/owncloud/web/issues/4860
   https://github.com/owncloud/web/pull/4918

* Change - Update owncloud Design System to v6.0.1: [#4940](https://github.com/owncloud/web/pull/4940)

   - Lots of updates regarding accessibility topics, an updated color palette and custom CSS
   properties to allow for (runtime) theming. - ODS started to use peerDependencies now, we
   adopted this and added the required packages

   https://github.com/owncloud/web/issues/4331
   https://github.com/owncloud/web/pull/4940
   https://github.com/owncloud/web/pull/4925
   https://github.com/owncloud/web/pull/4862
   https://github.com/owncloud/web/pull/4983

* Change - New files list: [#4627](https://github.com/owncloud/web/pull/4627)

   We integrated the new oc-table-files component from our design system. This includes
   breaking changes in how we load resources in our files app. We refactored our files app codebase
   into views, so that only subcomponents live in the components directory.

   https://github.com/owncloud/web/pull/4627

* Enhancement - A11y improvements for files app bar: [#4786](https://github.com/owncloud/web/issues/4786)

   If we select resources in the files list, an action context menu appears, to improve a11y we need
   an aria live region element to announce that.

   https://github.com/owncloud/web/issues/4786
   https://github.com/owncloud/web/pull/4833

* Enhancement - Enable files app search bar to be toggleable on a per-route basis: [#4815](https://github.com/owncloud/web/pull/4815)

   Permits the search bar in the files app to be toggleable on a per-route basis as shown or hidden.

   https://github.com/owncloud/web/pull/4815

* Enhancement - Add web-pkg package: [#4907](https://github.com/owncloud/web/pull/4907)

   We added web-pkg as a new package. It is supposed to be the central location for reuse of generic
   functionality.

   https://github.com/owncloud/web/pull/4907

* Enhancement - Implement live region updates on route changes: [#4812](https://github.com/owncloud/web/pull/4812)

   https://github.com/owncloud/web/issues/4346
   https://github.com/owncloud/web/pull/4812

* Enhancement - Use list for displaying added people: [#4915](https://github.com/owncloud/web/pull/4915)

   We've changed the HTML elements in the people accordion when adding new people. People added
   via people autocomplete are now displayed in a list element to use correct structure for screen
   readers.

   https://github.com/owncloud/web/pull/4915

* Enhancement - Runtime theming: [#4822](https://github.com/owncloud/web/pull/4822)

   It's now possible to specify a custom theme and have logos, brand slogan and colors changed to
   modify the appearance of your ownCloud web frontend.

   https://github.com/owncloud/web/issues/2362
   https://github.com/owncloud/web/pull/4822

* Enhancement - Add "Shared via link" page: [#4881](https://github.com/owncloud/web/pull/4881)

   We've added a new page called "Shared via link". This page displays a files list containing only
   resources shared via public links.

   https://github.com/owncloud/web/pull/4881

* Enhancement - Use ODS translations: [#4934](https://github.com/owncloud/web/pull/4934)

   Some ODS components were using their own translation strings which were availabel in the ODS
   but not exported there/imported in the web project. Now, we import the translation strings
   from the ODS package and merge them with the web translations.

   https://github.com/owncloud/web/pull/4934

Changelog for ownCloud Web [2.1.0] (2021-03-24)
=======================================
The following sections list the changes in ownCloud web 2.1.0 relevant to
ownCloud admins and users.

[2.1.0]: https://github.com/owncloud/web/compare/v2.0.2...v2.1.0

Summary
-------

* Bugfix - Fix missing translations in application menu: [#4830](https://github.com/owncloud/web/pull/4830)
* Bugfix - NODE_ENV based on rollup mode: [#4819](https://github.com/owncloud/web/issues/4819)
* Bugfix - Remove unsupported shareType: [#4809](https://github.com/owncloud/web/pull/4809)
* Enhancement - A11y improvements for meta attributes: [#4342](https://github.com/owncloud/web/issues/4342)
* Enhancement - Set locale on moment-js to render translated strings: [#4826](https://github.com/owncloud/web/pull/4826)
* Enhancement - Use pre-signed url download for password protected shares: [#38376](https://github.com/owncloud/core/pull/38376)

Details
-------

* Bugfix - Fix missing translations in application menu: [#4830](https://github.com/owncloud/web/pull/4830)

   https://github.com/owncloud/web/pull/4830

* Bugfix - NODE_ENV based on rollup mode: [#4819](https://github.com/owncloud/web/issues/4819)

   The NODE_ENV was set to production by default, now we use development if rollup is started in
   watch mode so that the vue devtools can be used.

   https://github.com/owncloud/web/issues/4819
   https://github.com/owncloud/web/pull/4820

* Bugfix - Remove unsupported shareType: [#4809](https://github.com/owncloud/web/pull/4809)

   We don't support 'userGroup' (originally 'contact', shareType `2`) on the backend side
   anymore, so we delete it on the frontend, too.

   https://github.com/owncloud/web/pull/4809

* Enhancement - A11y improvements for meta attributes: [#4342](https://github.com/owncloud/web/issues/4342)

   For a11y the html language attribute will be set dynamically <html lang="xx"/>. For a11y the
   title will be set automatically following the schema: sub item (e.G file) - route (e.g All
   Files) - general name (e.g ownCloud)

   https://github.com/owncloud/web/issues/4342
   https://github.com/owncloud/web/issues/4338
   https://github.com/owncloud/web/pull/4811

* Enhancement - Set locale on moment-js to render translated strings: [#4826](https://github.com/owncloud/web/pull/4826)

   For i18n purposes we set the moment-js locale to the current selected locale (language) this
   allows us to show translated string for example in the updated column in the All files list
   (web-app-files package)

   https://github.com/owncloud/web/pull/4826

* Enhancement - Use pre-signed url download for password protected shares: [#38376](https://github.com/owncloud/core/pull/38376)

   Replaced the blob download with a normal download using a pre-signed url provided by the
   backend.

   https://github.com/owncloud/core/pull/38376
   https://github.com/owncloud/web/pull/4689

Changelog for ownCloud Web [2.0.2] (2021-03-08)
=======================================
The following sections list the changes in ownCloud web 2.0.2 relevant to
ownCloud admins and users.

[2.0.2]: https://github.com/owncloud/web/compare/v2.0.1...v2.0.2

Summary
-------

* Change - Suppress redirect error during authorization: [#4759](https://github.com/owncloud/web/pull/4759)

Details
-------

* Change - Suppress redirect error during authorization: [#4759](https://github.com/owncloud/web/pull/4759)

   We've suppressed the error appearing in the console which warned about redirect happening
   after the oidc callback page. This error is being shown because after the oidc callback has
   successfully processed the authorization request we are redirecting to the `/` path which
   immediately does another redirect to the extension set as default one. In the context of Vue
   router, this is considered an error even though for us it is a valid use case. The error is only
   informative thus no issue is going to surface if we suppress it. This way we are getting closer to
   a clean console without errors.

   https://github.com/owncloud/web/pull/4759

Changelog for ownCloud Web [2.0.1] (2021-02-18)
=======================================
The following sections list the changes in ownCloud web 2.0.1 relevant to
ownCloud admins and users.

[2.0.1]: https://github.com/owncloud/web/compare/v2.0.0...v2.0.1

Summary
-------

* Bugfix - Fix oc10 deployment after switch to rollup: [#4757](https://github.com/owncloud/web/pull/4757)
* Bugfix - Fix showing white page with no message if the config could not be parsed: [#4636](https://github.com/owncloud/web/issues/4636)
* Bugfix - Allow search in additional share info: [#1656](https://github.com/owncloud/ocis/issues/1656)

Details
-------

* Bugfix - Fix oc10 deployment after switch to rollup: [#4757](https://github.com/owncloud/web/pull/4757)

   Our first release of the oc10 app after the switch to rollup as bundler had a bug as it didn't
   reflect the new folder structure of the app in the allowed folders. This has been fixed by
   updating the allowed folders.

   https://github.com/owncloud/web/pull/4757

* Bugfix - Fix showing white page with no message if the config could not be parsed: [#4636](https://github.com/owncloud/web/issues/4636)

   When the config file could not be parsed because of some mistake in the JSON, an empty page
   without any error message would be shown to the user. We've fixed that behavior and showing now
   an error page and details of the error in the console.

   https://github.com/owncloud/web/issues/4636
   https://github.com/owncloud/web/pull/4749

* Bugfix - Allow search in additional share info: [#1656](https://github.com/owncloud/ocis/issues/1656)

   We fixed that searching for a potential sharee didn't look at the additional share info.

   https://github.com/owncloud/ocis/issues/1656
   https://github.com/owncloud/web/pull/4753

Changelog for ownCloud Web [2.0.0] (2021-02-16)
=======================================
The following sections list the changes in ownCloud web 2.0.0 relevant to
ownCloud admins and users.

[2.0.0]: https://github.com/owncloud/web/compare/v1.0.1...v2.0.0

Summary
-------

* Change - Switch from webpack to rollup: [#4584](https://github.com/owncloud/web/pull/4584)
* Change - Update ODS to 2.1.2: [#4594](https://github.com/owncloud/web/pull/4594)

Details
-------

* Change - Switch from webpack to rollup: [#4584](https://github.com/owncloud/web/pull/4584)

   We replaced the bundler that we used so far (webpack) with rollup and reorganized the project
   structure. This hopefully makes the project structure easier to understand and thus help with
   onboarding. Another improvement is that the overall bundle size is much smaller now.

   https://github.com/owncloud/web/pull/4584

* Change - Update ODS to 2.1.2: [#4594](https://github.com/owncloud/web/pull/4594)

   We updated the ownCloud Design System to 2.1.2. See the linked releases for details.

   https://github.com/owncloud/web/pull/4594
   https://github.com/owncloud/owncloud-design-system/releases/tag/v2.1.0
   https://github.com/owncloud/owncloud-design-system/releases/tag/v2.1.1
   https://github.com/owncloud/owncloud-design-system/releases/tag/v2.1.2

Changelog for ownCloud Web [1.0.1] (2021-01-08)
=======================================
The following sections list the changes in ownCloud web 1.0.1 relevant to
ownCloud admins and users.

[1.0.1]: https://github.com/owncloud/web/compare/v1.0.0...v1.0.1

Summary
-------

* Bugfix - Fully clickable sidebar toggle button: [#4130](https://github.com/owncloud/web/issues/4130)
* Bugfix - Allow server URL without trailing slash: [#4536](https://github.com/owncloud/web/pull/4536)
* Change - Rename confirmation of copy action: [#4590](https://github.com/owncloud/web/pull/4590)
* Change - Allow to disable previews in file lists: [#4513](https://github.com/owncloud/web/pull/4513)
* Change - Add controllers for oc10 app deployment: [#4537](https://github.com/owncloud/web/pull/4537)

Details
-------

* Bugfix - Fully clickable sidebar toggle button: [#4130](https://github.com/owncloud/web/issues/4130)

   The button for hiding/showing the left sidebar (burger menu) was not fully clickable. We fixed
   this by removing a negative margin that pulled the rest of the topbar over the button.

   https://github.com/owncloud/web/issues/4130
   https://github.com/owncloud/web/pull/4572

* Bugfix - Allow server URL without trailing slash: [#4536](https://github.com/owncloud/web/pull/4536)

   The server URL in the config was leading to issues resolving resources when it had no trailing
   slash. We are now checking if the trailing slash is missing and add it upon applying the config if
   needed.

   https://github.com/owncloud/web/pull/4536

* Change - Rename confirmation of copy action: [#4590](https://github.com/owncloud/web/pull/4590)

   We've changed the label of the confirmation button in copy view. Instead of "Copy here", we used
   "Paste here".

   https://github.com/owncloud/web/pull/4590

* Change - Allow to disable previews in file lists: [#4513](https://github.com/owncloud/web/pull/4513)

   We introduced a new config option to disable previews. To do so, set `"disablePreviews": true`
   to the config.json file.

   https://github.com/owncloud/web/pull/4513

* Change - Add controllers for oc10 app deployment: [#4537](https://github.com/owncloud/web/pull/4537)

   We added a config endpoint for when ownCloud Web is deployed as ownCloud 10 app. The config.json
   file must not be placed in the apps folder because it would cause the app integrity check to fail.
   In addition to the config endpoint we added a wildcard endpoint for serving static assets (js
   bundles, css, etc) of the ownCloud Web javascript application by their paths.

   https://github.com/owncloud/web/pull/4537

Changelog for ownCloud Web [1.0.0] (2020-12-16)
=======================================
The following sections list the changes in ownCloud web 1.0.0 relevant to
ownCloud admins and users.

[1.0.0]: https://github.com/owncloud/web/compare/v0.29.0...v1.0.0

Summary
-------

* Bugfix - Do not use origin location to open editors: [#4500](https://github.com/owncloud/web/pull/4500)
* Bugfix - Enable route checks for file actions: [#986](https://github.com/owncloud/ocis/issues/986)
* Bugfix - Fix role selection for public links: [#4504](https://github.com/owncloud/web/pull/4504)
* Bugfix - Fix navigation rendering: [#1031](https://github.com/owncloud/ocis/issues/1031)
* Bugfix - Hide modals on logout: [#1064](https://github.com/owncloud/ocis/issues/1064)
* Enhancement - Add the option to decline accepted shares: [#985](https://github.com/owncloud/ocis/issues/985)
* Enhancement - Show status of accepted shares: [#985](https://github.com/owncloud/ocis/issues/985)
* Enhancement - Add oc10 app build artifact: [#4427](https://github.com/owncloud/web/pull/4427)
* Enhancement - Extend default apps: [#4493](https://github.com/owncloud/web/pull/4493)
* Enhancement - Add custom configuration to the draw.io app: [#4337](https://github.com/owncloud/phoenix/pull/4337)
* Enhancement - Add support for .vsdx files in the draw.io app: [#4337](https://github.com/owncloud/phoenix/pull/4337)
* Enhancement - Position of main dom node: [#1052](https://github.com/owncloud/ocis/issues/1052)
* Enhancement - Wait for all required data: [#884](https://github.com/owncloud/ocis/issues/884)
* Enhancement - Update ODS to 2.0.3: [#4488](https://github.com/owncloud/web/pull/4488)
* Enhancement - Update ODS to 2.0.4: [#45001](https://github.com/owncloud/web/pull/45001)

Details
-------

* Bugfix - Do not use origin location to open editors: [#4500](https://github.com/owncloud/web/pull/4500)

   When opening the editors view in a new tab, we were using the origin of location. This would break
   in case we have Web deployed to a different path than root e.g. `http://owncloud/apps/web`.

   https://github.com/owncloud/web/pull/4500

* Bugfix - Enable route checks for file actions: [#986](https://github.com/owncloud/ocis/issues/986)

   The checks on which route an extension is enabled were not active (and inverted). We fixed this
   so that editors only appear on configured routes now.

   https://github.com/owncloud/ocis/issues/986
   https://github.com/owncloud/web/pull/4436

* Bugfix - Fix role selection for public links: [#4504](https://github.com/owncloud/web/pull/4504)

   The dropdown for the role selection in public links was not working anymore - the model didn't
   react to selections. Fixed it by bringing back a field that was accidentally removed.

   https://github.com/owncloud/web/pull/4504

* Bugfix - Fix navigation rendering: [#1031](https://github.com/owncloud/ocis/issues/1031)

   - ADD_NAV_ITEM mutation now gets copied instead of referenced to trigger a state change. -
   applicationsList navItem item needs a copy instead of mutating the base item - check for
   route.path instead of route name in ADD_NAV_ITEM which can change over time

   https://github.com/owncloud/ocis/issues/1031
   https://github.com/owncloud/ocis/issues/1043
   https://github.com/owncloud/phoenix/pull/4430

* Bugfix - Hide modals on logout: [#1064](https://github.com/owncloud/ocis/issues/1064)

   Hide shown modal if user gets logged out while it's visible

   https://github.com/owncloud/ocis/issues/1064
   https://github.com/owncloud/web/pull/4472

* Enhancement - Add the option to decline accepted shares: [#985](https://github.com/owncloud/ocis/issues/985)

   Declined shares could be accepted retroactively but accepted shares could not be declined.

   https://github.com/owncloud/ocis/issues/985

* Enhancement - Show status of accepted shares: [#985](https://github.com/owncloud/ocis/issues/985)

   The status column of accepted shares was blank.

   https://github.com/owncloud/ocis/issues/985

* Enhancement - Add oc10 app build artifact: [#4427](https://github.com/owncloud/web/pull/4427)

   We've added a build step to the release process which creates an ownCloud Web bundle which can be
   deployed as an app to ownCloud 10.

   https://github.com/owncloud/web/pull/4427

* Enhancement - Extend default apps: [#4493](https://github.com/owncloud/web/pull/4493)

   When release tarballs are created, we are copying the config.json.dist into them as a default
   config. In that file were so far only "files" app enabled. This adds also "media viewer" and
   "draw-io" into apps enabled by default.

   https://github.com/owncloud/web/pull/4493

* Enhancement - Add custom configuration to the draw.io app: [#4337](https://github.com/owncloud/phoenix/pull/4337)

   Added mechanism to specify custom configuration instead of using a hardcoded one. The new
   settings include support for a custom draw.io server, enabling autosave and using a specific
   theme.

   https://github.com/owncloud/phoenix/issues/4328
   https://github.com/owncloud/phoenix/pull/4337

* Enhancement - Add support for .vsdx files in the draw.io app: [#4337](https://github.com/owncloud/phoenix/pull/4337)

   Added the support to open .vsdx files (Microsoft Visio Files) directly from OwnCloud, instead
   of creating a new diagram to import the file from local storage.

   https://github.com/owncloud/phoenix/issues/4327
   https://github.com/owncloud/phoenix/pull/4337

* Enhancement - Position of main dom node: [#1052](https://github.com/owncloud/ocis/issues/1052)

   Div#main is now positioned relative, this way child apps are able to orientate their
   containers absolute to it.

   https://github.com/owncloud/ocis/issues/1052
   https://github.com/owncloud/web/pull/4489
   https://github.com/owncloud/owncloud-design-system/pull/1002

* Enhancement - Wait for all required data: [#884](https://github.com/owncloud/ocis/issues/884)

   Before this we rendered the ui no matter if every required data already is loaded or not. For
   example the current users language from the ocis settings service. One potential problem was
   the flickering in the ui or that the default language was shown before it switches to the
   settings language of current user. Instead we now show a loading screen and wait for everything
   that is required before rendering anything else.

   https://github.com/owncloud/ocis/issues/884
   https://github.com/owncloud/ocis/issues/1043

* Enhancement - Update ODS to 2.0.3: [#4488](https://github.com/owncloud/web/pull/4488)

   We've updated the ownCloud design system to version 2.0.3.

   https://github.com/owncloud/web/pull/4488
   https://github.com/owncloud/owncloud-design-system/releases/tag/v2.0.3

* Enhancement - Update ODS to 2.0.4: [#45001](https://github.com/owncloud/web/pull/45001)

   We've updated the ownCloud design system to version 2.0.4.

   https://github.com/owncloud/web/pull/45001
   https://github.com/owncloud/owncloud-design-system/releases/tag/v2.0.4

Changelog for ownCloud Web [0.29.0] (2020-12-07)
=======================================
The following sections list the changes in ownCloud web 0.29.0 relevant to
ownCloud admins and users.

[0.29.0]: https://github.com/owncloud/web/compare/v0.28.0...v0.29.0

Summary
-------

* Bugfix - Public link glitches: [#1028](https://github.com/owncloud/ocis/issues/1028)
* Change - Use labels to display share info: [#4410](https://github.com/owncloud/web/pull/4410)
* Enhancement - Display full public and private links: [#4410](https://github.com/owncloud/web/pull/4410)

Details
-------

* Bugfix - Public link glitches: [#1028](https://github.com/owncloud/ocis/issues/1028)

   We fixed a couple of glitches with public links: - Creating a folder in a public link context was
   showing an error message although the folder was created correctly. This was happening
   because reloading the current folder didn't take the public link context into account. - For
   public links with editor role the batch actions at the top of the files list were not showing. The
   public links route didn't have a specific flag for showing the batch actions. - Quick actions
   for sharing are not available in public link contexts by design. The check printed an error in
   the javascript console though. We made this check silent now.

   https://github.com/owncloud/ocis/issues/1028
   https://github.com/owncloud/web/pull/4425

* Change - Use labels to display share info: [#4410](https://github.com/owncloud/web/pull/4410)

   We've changed the way of displaying share information for public links and people. Every
   information is now displayed in its own label.

   https://github.com/owncloud/web/pull/4410

* Enhancement - Display full public and private links: [#4410](https://github.com/owncloud/web/pull/4410)

   Below the names of public and private links we've added the respective full URL so that users can
   copy it without the copy to clipboard button.

   https://github.com/owncloud/web/pull/4410

Changelog for ownCloud Web [0.28.0] (2020-12-04)
=======================================
The following sections list the changes in ownCloud web 0.28.0 relevant to
ownCloud admins and users.

[0.28.0]: https://github.com/owncloud/web/compare/v0.27.0...v0.28.0

Summary
-------

* Bugfix - Don't break file/folder names in text editor: [#4391](https://github.com/owncloud/web/pull/4391)
* Change - Configurable home path: [#4411](https://github.com/owncloud/web/pull/4411)
* Change - Show dedicated 404 page for invalid resource references: [#4411](https://github.com/owncloud/web/pull/4411)

Details
-------

* Bugfix - Don't break file/folder names in text editor: [#4391](https://github.com/owncloud/web/pull/4391)

   The label in the text editor that displays the path of the active file was removing the first
   character instead of trimming leading slashes. This might have lead to situations where
   actual characters were removed. We fixed this by only removing leading slahes instead of
   blindly removing the first character.

   https://github.com/owncloud/web/pull/4391

* Change - Configurable home path: [#4411](https://github.com/owncloud/web/pull/4411)

   We introduced a config.json option `homeFolder` which let's you specify a default location
   when opening the `All files` view. Please refer to the documentation for details.

   https://github.com/owncloud/web/pull/4411
   https://owncloud.github.io/clients/web/getting-started/

* Change - Show dedicated 404 page for invalid resource references: [#4411](https://github.com/owncloud/web/pull/4411)

   When visiting a public link or the `All files` page with an invalid resource in the URL (e.g.
   because it was deleted in the meantime) we now show a dedicated page which explains that the
   resource could not be found and offers a link to go back to the respective root (»All files«
   home location or the root of the public link). The breadcrumbs have been made available on
   invalid resources as well, so that those could be used for more precise navigation instead of
   jumping back to the root.

   https://github.com/owncloud/web/pull/4411

Changelog for ownCloud Web [0.27.0] (2020-11-24)
=======================================
The following sections list the changes in ownCloud web 0.27.0 relevant to
ownCloud admins and users.

[0.27.0]: https://github.com/owncloud/web/compare/v0.26.0...v0.27.0

Summary
-------

* Bugfix - Unavailable extensions causing route duplication: [#4382](https://github.com/owncloud/web/pull/4382)
* Change - Configurable default extension: [#4382](https://github.com/owncloud/web/pull/4382)
* Change - Load extensions config: [#4380](https://github.com/owncloud/web/pull/4380)

Details
-------

* Bugfix - Unavailable extensions causing route duplication: [#4382](https://github.com/owncloud/web/pull/4382)

   There was an error in the extension loading handlers which caused routes to be loaded multiple
   times when extensions from the config.json were unavailable. We hardened the extension
   loading handlers to just skip those extensions.

   https://github.com/owncloud/web/pull/4382

* Change - Configurable default extension: [#4382](https://github.com/owncloud/web/pull/4382)

   We introduced a config option in the config.json file which allows to configure the default
   extension for ownCloud Web. Any of the configured extension ids can be chosen as default
   extension. If none is provided, we fall back to the files extension.

   https://github.com/owncloud/web/pull/4382

* Change - Load extensions config: [#4380](https://github.com/owncloud/web/pull/4380)

   We've started loading the config of extensions which can now be defined as an object in the
   `external_apps` in the config.json.

   https://github.com/owncloud/web/pull/4380

Changelog for ownCloud Web [0.26.0] (2020-11-23)
=======================================
The following sections list the changes in ownCloud web 0.26.0 relevant to
ownCloud admins and users.

[0.26.0]: https://github.com/owncloud/web/compare/v0.25.0...v0.26.0

Summary
-------

* Bugfix - Fix edit public link view: [#4374](https://github.com/owncloud/web/pull/4374)
* Bugfix - Icon mappings: [#4357](https://github.com/owncloud/web/pull/4357)
* Enhancement - Use handler of file editors: [#4324](https://github.com/owncloud/web/pull/4324)
* Enhancement - Add custom icons in the new file menu: [#4375](https://github.com/owncloud/web/pull/4375)
* Enhancement - Theme redirect and access denied pages: [#4373](https://github.com/owncloud/web/pull/4373)
* Enhancement - Update ODS to 2.0.0: [#4373](https://github.com/owncloud/web/pull/4373)

Details
-------

* Bugfix - Fix edit public link view: [#4374](https://github.com/owncloud/web/pull/4374)

   We've fixed the issue that edit public link view in the sidebar was overlapping with the
   versions accordion.

   https://github.com/owncloud/web/pull/4374

* Bugfix - Icon mappings: [#4357](https://github.com/owncloud/web/pull/4357)

   The file type icon mappings contained some mappings to non-existing icon files. We fixed
   those.

   https://github.com/owncloud/ocis/issues/905
   https://github.com/owncloud/web/pull/4357

* Enhancement - Use handler of file editors: [#4324](https://github.com/owncloud/web/pull/4324)

   In case the extension is a file editor which defines a custom handler, we are triggering that
   handler instead of trying to open any assigned route.

   https://github.com/owncloud/web/pull/4324

* Enhancement - Add custom icons in the new file menu: [#4375](https://github.com/owncloud/web/pull/4375)

   We've added an option to display own icon in the new file menu.

   https://github.com/owncloud/web/pull/4375

* Enhancement - Theme redirect and access denied pages: [#4373](https://github.com/owncloud/web/pull/4373)

   We've adjusted the theme on OIDC redirect and access denied pages to use correct logo and
   background. We've also added those two values into the theming capabilities.

   https://github.com/owncloud/web/pull/4373

* Enhancement - Update ODS to 2.0.0: [#4373](https://github.com/owncloud/web/pull/4373)

   We've updated the ownCloud design system to version 2.0.0.

   https://github.com/owncloud/web/pull/4373
   https://github.com/owncloud/owncloud-design-system/releases/tag/v2.0.0

Changelog for ownCloud Web [0.25.0] (2020-11-16)
=======================================
The following sections list the changes in ownCloud web 0.25.0 relevant to
ownCloud admins and users.

[0.25.0]: https://github.com/owncloud/web/compare/v0.24.0...v0.25.0

Summary
-------

* Bugfix - Make available file actions (more) aware of the page context: [#4255](https://github.com/owncloud/web/pull/4255)
* Bugfix - Fix loginAsUser: [#4297](https://github.com/owncloud/web/pull/4297)
* Change - File actions as accordion item in right sidebar: [#4255](https://github.com/owncloud/web/pull/4255)
* Enhancement - Added support for OpenID Connect Dynamic Client Registration 1.0: [#4286](https://github.com/owncloud/web/pull/4286)

Details
-------

* Bugfix - Make available file actions (more) aware of the page context: [#4255](https://github.com/owncloud/web/pull/4255)

   The list of available file actions sometimes contained actions which should not be possible
   and sometimes was missing actions that should be possible. Most important examples are that
   copy/move should not be available on `shared with me` and `shared with others` pages (but they
   were) and that the set of file actions from the `All files` page should also be available for the
   favorites page (but were not).

   https://github.com/owncloud/web/pull/4255

* Bugfix - Fix loginAsUser: [#4297](https://github.com/owncloud/web/pull/4297)

   LoginAsUser wasn't waiting until the loading finished. Added an additional check

   https://github.com/owncloud/web/pull/4297

* Change - File actions as accordion item in right sidebar: [#4255](https://github.com/owncloud/web/pull/4255)

   We moved the menu items from `file actions` dropdown menu (the "three dots menu") as accordion
   item into the right sidebar and made it the default item to be opened when clicking the three
   dots. For the sake of consistency we now also made the right sidebar available for the `Deleted
   files` page, where we offer the actions accordion item with a `Restore` and `Delete` action.

   https://github.com/owncloud/web/pull/4255

* Enhancement - Added support for OpenID Connect Dynamic Client Registration 1.0: [#4286](https://github.com/owncloud/web/pull/4286)

   OwnCloud Web can use the dynamic client registration protocol to exchange client id and client
   secret woth the IdP

   https://github.com/owncloud/web/pull/4286
   https://github.com/owncloud/web/pull/4306

Changelog for ownCloud Web [0.24.0] (2020-11-06)
=======================================
The following sections list the changes in ownCloud web 0.24.0 relevant to
ownCloud admins and users.

[0.24.0]: https://github.com/owncloud/web/compare/v0.23.0...v0.24.0

Summary
-------

* Bugfix - Fix browse to files page in the ui tests: [#4281](https://github.com/owncloud/web/issues/4281)
* Enhancement - Display collaborators type: [#4203](https://github.com/owncloud/web/pull/4203)

Details
-------

* Bugfix - Fix browse to files page in the ui tests: [#4281](https://github.com/owncloud/web/issues/4281)

   When the ui tests where executing the "the user has browsed to the files page" step then it
   wouldn't wait until the files were loaded.

   https://github.com/owncloud/web/issues/4281

* Enhancement - Display collaborators type: [#4203](https://github.com/owncloud/web/pull/4203)

   We've added a new line into the collaborators autocomplete and list in the sidebar to display
   their type.

   https://github.com/owncloud/web/pull/4203

Changelog for ownCloud Web [0.23.0] (2020-10-30)
=======================================
The following sections list the changes in ownCloud web 0.23.0 relevant to
ownCloud admins and users.

[0.23.0]: https://github.com/owncloud/web/compare/v0.22.0...v0.23.0

Summary
-------

* Change - App sidebar accordion instead of tabs: [#4249](https://github.com/owncloud/web/pull/4249)

Details
-------

* Change - App sidebar accordion instead of tabs: [#4249](https://github.com/owncloud/web/pull/4249)

   We replaced the tabs in the right app-sidebar with an accordion.

   https://github.com/owncloud/web/pull/4249

Changelog for ownCloud Web [0.22.0] (2020-10-26)
=======================================
The following sections list the changes in ownCloud web 0.22.0 relevant to
ownCloud admins and users.

[0.22.0]: https://github.com/owncloud/web/compare/v0.21.0...v0.22.0

Summary
-------

* Change - Set icon for unknown file types to "file": [#4237](https://github.com/owncloud/web/pull/4237)
* Change - Attach share permission to roles: [#4216](https://github.com/owncloud/web/pull/4216)
* Change - Update ODS to v1.12.2: [#4239](https://github.com/owncloud/web/pull/4239)
* Enhancement - Auto-close alerts: [#4236](https://github.com/owncloud/web/pull/4236)

Details
-------

* Change - Set icon for unknown file types to "file": [#4237](https://github.com/owncloud/web/pull/4237)

   We've changed the icon for unknown file types to "file".

   https://github.com/owncloud/web/pull/4237
   https://owncloud.design/#/Design%20Tokens/Icon

* Change - Attach share permission to roles: [#4216](https://github.com/owncloud/web/pull/4216)

   We've attached the share permission of collaborators to roles. There is no longer a share
   additional permission.

   https://github.com/owncloud/web/pull/4216

* Change - Update ODS to v1.12.2: [#4239](https://github.com/owncloud/web/pull/4239)

   We updated ODS to v1.12.2. Please refer to the changelog of ODS.

   https://github.com/owncloud/web/pull/4239
   https://github.com/owncloud/owncloud-design-system/releases/tag/v1.12.2

* Enhancement - Auto-close alerts: [#4236](https://github.com/owncloud/web/pull/4236)

   We've added a property which enables alerts to be automatically closed. When enabling the
   auto-close, it will get assigned timeout of 5 seconds. Default timeout can be overwritten
   inside of the `autoClose` object.

   https://github.com/owncloud/web/pull/4236

Changelog for ownCloud Web [0.21.0] (2020-10-21)
=======================================
The following sections list the changes in ownCloud web 0.21.0 relevant to
ownCloud admins and users.

[0.21.0]: https://github.com/owncloud/web/compare/v0.20.0...v0.21.0

Summary
-------

* Bugfix - OIDC logout: [#266](https://github.com/owncloud/product/issues/266)
* Bugfix - Do not display "empty folder" message when there is any content: [#263](https://github.com/owncloud/product/issues/263)
* Change - Sensible default apps in example configs: [#4155](https://github.com/owncloud/web/pull/4155)

Details
-------

* Bugfix - OIDC logout: [#266](https://github.com/owncloud/product/issues/266)

   We've fixed the bug that the user sometimes got immediately logged back into the web UI after
   clicking on logout.

   https://github.com/owncloud/product/issues/266
   https://github.com/owncloud/web/pull/4211

* Bugfix - Do not display "empty folder" message when there is any content: [#263](https://github.com/owncloud/product/issues/263)

   We've fixed that when some of the file/share lists were being loaded, the "empty folder"
   message sometimes briefly appeared even though the list wasn't empty.

   https://github.com/owncloud/product/issues/263
   https://github.com/owncloud/web/pull/4162

* Change - Sensible default apps in example configs: [#4155](https://github.com/owncloud/web/pull/4155)

   We adapted the example configs for oc10 and owncloud so that the files and media-viewer apps are
   enabled by default.

   https://github.com/owncloud/web/pull/4155

Changelog for ownCloud Web [0.20.0] (2020-10-08)
=======================================
The following sections list the changes in ownCloud web 0.20.0 relevant to
ownCloud admins and users.

[0.20.0]: https://github.com/owncloud/web/compare/v0.19.0...v0.20.0

Summary
-------

* Change - Enable autoredirect to the IdP: [#4138](https://github.com/owncloud/web/pull/4138)

Details
-------

* Change - Enable autoredirect to the IdP: [#4138](https://github.com/owncloud/web/pull/4138)

   We've added a key into the theme to enable autoredirect to the IdP when entering ocis-web
   instead of displaying the login page first. The default value is set to true.

   https://github.com/owncloud/web/pull/4138

Changelog for ownCloud Web [0.19.0] (2020-10-06)
=======================================
The following sections list the changes in ownCloud web 0.19.0 relevant to
ownCloud admins and users.

[0.19.0]: https://github.com/owncloud/web/compare/v0.18.0...v0.19.0

Summary
-------

* Change - Customizable menu association: [#4133](https://github.com/owncloud/web/pull/4133)

Details
-------

* Change - Customizable menu association: [#4133](https://github.com/owncloud/web/pull/4133)

   We now allow the redirect navItems and links into the user menu. This can be done by simply
   assigning the `"menu": "user"` to the respective navItem. It works for both extensions and
   external links (`applications` key in config.json).

   https://github.com/owncloud/web/pull/4133

Changelog for ownCloud Web [0.18.0] (2020-10-05)
=======================================
The following sections list the changes in ownCloud web 0.18.0 relevant to
ownCloud admins and users.

[0.18.0]: https://github.com/owncloud/web/compare/v0.17.0...v0.18.0

Summary
-------

* Change - Change sharing wording: [#4120](https://github.com/owncloud/web/pull/4120)
* Enhancement - Update owncloud-design-system to v1.12.1: [#4120](https://github.com/owncloud/web/pull/4120)

Details
-------

* Change - Change sharing wording: [#4120](https://github.com/owncloud/web/pull/4120)

   Renamed "Share" action to "Add people" and header column in the shared with list from "People"
   to "Shared with".

   https://github.com/owncloud/web/pull/4120

* Enhancement - Update owncloud-design-system to v1.12.1: [#4120](https://github.com/owncloud/web/pull/4120)

   We've updated our design system to version 1.12.1. To see all new changes which this update
   brings, please check the changelog below.

   https://github.com/owncloud/web/pull/4120
   https://github.com/owncloud/owncloud-design-system/releases/tag/v1.12.1

Changelog for ownCloud Web [0.17.0] (2020-09-25)
=======================================
The following sections list the changes in ownCloud web 0.17.0 relevant to
ownCloud admins and users.

[0.17.0]: https://github.com/owncloud/web/compare/v0.16.0...v0.17.0

Summary
-------

* Bugfix - Added missing tooltips: [#4081](https://github.com/owncloud/web/pull/4081)
* Bugfix - Make file previews properly fit: [#232](https://github.com/owncloud/product/issues/232)
* Bugfix - Adjust behavior of public link password field: [#4077](https://github.com/owncloud/web/pull/4077)
* Change - Adjustments to roles selection dropdown: [#4080](https://github.com/owncloud/web/pull/4080)
* Change - Rename "trash bin" to "deleted files": [#4071](https://github.com/owncloud/web/pull/4071)
* Change - Add default action to click on file name: [#234](https://github.com/owncloud/product/issues/234)
* Change - Improve external links in app switcher: [#4092](https://github.com/owncloud/web/pull/4092)
* Change - More descriptive loading state: [#4099](https://github.com/owncloud/web/pull/4099)
* Change - Moved bottom actions menu into actions dropdown: [#234](https://github.com/owncloud/product/issues/234)
* Change - Renamed collaborators to people: [#4070](https://github.com/owncloud/web/pull/4070)
* Change - Update ODS to 1.11.0: [#4086](https://github.com/owncloud/web/pull/4086)
* Change - Shortened button label for creating public links: [#4072](https://github.com/owncloud/web/pull/4072)
* Enhancement - Remember public link password on page refresh: [#4083](https://github.com/owncloud/web/pull/4083)

Details
-------

* Bugfix - Added missing tooltips: [#4081](https://github.com/owncloud/web/pull/4081)

   We've added tooltips for the following:

   - top bar: notifications button and application switcher - file list: share indicators and
   quick actions - sharing in sidebar: action icons like edit, delete, copy

   https://github.com/owncloud/product/issues/231
   https://github.com/owncloud/web/pull/4081

* Bugfix - Make file previews properly fit: [#232](https://github.com/owncloud/product/issues/232)

   We've fixed the file preview to prevent overflowing vertically and also added CSS property to
   make sure the ratio is preserved

   https://github.com/owncloud/product/issues/232
   https://github.com/owncloud/web/pull/4073

* Bugfix - Adjust behavior of public link password field: [#4077](https://github.com/owncloud/web/pull/4077)

   The UX of the public link password field has been improved. The field is focussed automatically
   and the enter key submits the password. Also, in case of wrong password, an error message is now
   displayed.

   https://github.com/owncloud/product/issues/231
   https://github.com/owncloud/web/pull/4077

* Change - Adjustments to roles selection dropdown: [#4080](https://github.com/owncloud/web/pull/4080)

   The role description text from the roles selection button has been removed, but is still
   visible when opening the dropdown. The dropdown now also has a chevron icon to make it clearer
   that it is a dropdown.

   https://github.com/owncloud/product/issues/231
   https://github.com/owncloud/web/pull/4080

* Change - Rename "trash bin" to "deleted files": [#4071](https://github.com/owncloud/web/pull/4071)

   We've renamed the "trash bin" to the more appropriate wording "deleted files".

   https://github.com/owncloud/product/issues/231
   https://github.com/owncloud/web/pull/4071

* Change - Add default action to click on file name: [#234](https://github.com/owncloud/product/issues/234)

   When clicking on the file name in the files list, a default action is triggered which opens the
   first available file editor or viewer. If no file editor or viewer is available, the default
   action falls back to download.

   https://github.com/owncloud/product/issues/234
   https://github.com/owncloud/web/pull/4076
   https://github.com/owncloud/web/pull/4097

* Change - Improve external links in app switcher: [#4092](https://github.com/owncloud/web/pull/4092)

   We have added an option to set the link target in external application links (defaults to
   `_blank`). The app switcher now shows all native extensions first and items based on
   application links last.

   https://github.com/owncloud/web/pull/4092

* Change - More descriptive loading state: [#4099](https://github.com/owncloud/web/pull/4099)

   When browsing the different variations of the files list we removed the loader component at the
   top in favor of a spinner in the center of the viewport. The spinner has one line of text which
   describes what kind of data is being loaded.

   https://github.com/owncloud/web/pull/4099

* Change - Moved bottom actions menu into actions dropdown: [#234](https://github.com/owncloud/product/issues/234)

   We've removed the bottom file actions menu and moved all actions into the actions dropdown in
   the files list.

   https://github.com/owncloud/product/issues/234
   https://github.com/owncloud/web/pull/4076

* Change - Renamed collaborators to people: [#4070](https://github.com/owncloud/web/pull/4070)

   All visible occurrences of "collaborator" or "collaborators" have been replaced by "person"
   or "people" respectively. Additionally, the action "Add Collaborator" was changed to
   "Share".

   https://github.com/owncloud/product/issues/231
   https://github.com/owncloud/web/pull/4070

* Change - Update ODS to 1.11.0: [#4086](https://github.com/owncloud/web/pull/4086)

   We updated owncloud design system (ODS) to 1.11.0. This brings some features and required some
   changes: - Buttons: - require to be placed in a grid or with uk-flex for side by side positioning,
   - don't have an icon property anymore, - have a slot so that content of the button can be just
   anything - placement of the content in the button can be modified with new props
   `justify-content` and `gap` - new icons, which are used in the sidebar and for quick actions -
   sidebar has a property for hiding the navigation. It doesn't have internal logic anymore for
   hiding the navigation automatically.

   https://github.com/owncloud/web/pull/4086

* Change - Shortened button label for creating public links: [#4072](https://github.com/owncloud/web/pull/4072)

   The label of the button for creating public links in the links panel has been shortened to
   "Public link" instead of "Add public link" since the plus sign already implies adding. An Aria
   label has been added for clarification when using screen readers.

   https://github.com/owncloud/web/issues/231
   https://github.com/owncloud/web/pull/4072

* Enhancement - Remember public link password on page refresh: [#4083](https://github.com/owncloud/web/pull/4083)

   When refreshing the page in the file list of a public link share, the user doesn't need to enter
   the password again. This only applies for the current page and the password is forgotten by the
   browser again upon closing or switching to another site.

   https://github.com/owncloud/product/issues/231
   https://github.com/owncloud/web/pull/4083

Changelog for ownCloud Web [0.16.0] (2020-08-24)
=======================================
The following sections list the changes in ownCloud web 0.16.0 relevant to
ownCloud admins and users.

[0.16.0]: https://github.com/owncloud/web/compare/v0.15.0...v0.16.0

Summary
-------

* Change - Add default external apps for ocis: [#3967](https://github.com/owncloud/web/pull/3967)
* Enhancement - Add info about number of selected items and their size: [#122](https://github.com/owncloud/product/issues/122)

Details
-------

* Change - Add default external apps for ocis: [#3967](https://github.com/owncloud/web/pull/3967)

   We are enabling the settings-ui and accounts-ui by default now for ocis.

   https://github.com/owncloud/web/pull/3967

* Enhancement - Add info about number of selected items and their size: [#122](https://github.com/owncloud/product/issues/122)

   We've added information about the number of selected items and their size above the files list
   next to batch actions.

   https://github.com/owncloud/product/issues/122
   https://github.com/owncloud/web/pull/3850

Changelog for ownCloud Web [0.15.0] (2020-08-19)
=======================================
The following sections list the changes in ownCloud web 0.15.0 relevant to
ownCloud admins and users.

[0.15.0]: https://github.com/owncloud/web/compare/v0.14.0...v0.15.0

Summary
-------

* Change - Adapt to new ocis-settings data model: [#3806](https://github.com/owncloud/web/pull/3806)

Details
-------

* Change - Adapt to new ocis-settings data model: [#3806](https://github.com/owncloud/web/pull/3806)

   Ocis-settings introduced UUIDs and less verbose endpoint and message type names. This PR
   adjusts web accordingly.

   https://github.com/owncloud/web/pull/3806
   https://github.com/owncloud/owncloud-sdk/pull/520
   https://github.com/owncloud/ocis-settings/pull/46

Changelog for ownCloud Web [0.14.0] (2020-08-17)
=======================================
The following sections list the changes in ownCloud web 0.14.0 relevant to
ownCloud admins and users.

[0.14.0]: https://github.com/owncloud/web/compare/v0.13.0...v0.14.0

Summary
-------

* Bugfix - Fix display name when using oCIS as backend: [#3938](https://github.com/owncloud/web/pull/3938)
* Change - Differentiate between user-id and username: [#440](https://github.com/owncloud/ocis/issues/440)
* Change - Provide option for hiding the search bar: [#116](https://github.com/owncloud/product/issues/116)
* Change - Move information about current folder below the files list: [#120](https://github.com/owncloud/product/issues/120)
* Change - Use pre-signed URLs in media viewer: [#3803](https://github.com/owncloud/web/pull/3803)
* Change - Move quota indication to the left sidebar: [#121](https://github.com/owncloud/product/issues/121)
* Change - Move docs about hugo usage to ocis: [#3828](https://github.com/owncloud/web/pull/3828)
* Change - Get rid of static "Shared with:" label: [#123](https://github.com/owncloud/product/issues/123)
* Change - Large file downloads support with URL signing: [#3797](https://github.com/owncloud/web/pull/3797)
* Enhancement - Enable playing videos in media viewer: [#3803](https://github.com/owncloud/web/pull/3803)

Details
-------

* Bugfix - Fix display name when using oCIS as backend: [#3938](https://github.com/owncloud/web/pull/3938)

   We've fixed the display name when running ocis-web with oCIS as backend. The display name is now
   again displayed in the top bar and in the account page.

   https://github.com/owncloud/web/pull/3938

* Change - Differentiate between user-id and username: [#440](https://github.com/owncloud/ocis/issues/440)

   With oCIS user-id and username are not the same as is the case in ownCloud 10. We've started
   differentiating between them to correctly display all information in the accounts page. If
   the username is not available (oC10), we fall back to using user-id as the username.

   https://github.com/owncloud/ocis/issues/440
   https://github.com/owncloud/web/pull/3938

* Change - Provide option for hiding the search bar: [#116](https://github.com/owncloud/product/issues/116)

   We introduced a new `options.hideSearchBar` config variable which can be used to disable the
   search bar entirely.

   https://github.com/owncloud/product/issues/116
   https://github.com/owncloud/web/pull/3817

* Change - Move information about current folder below the files list: [#120](https://github.com/owncloud/product/issues/120)

   We've moved the information about current folder directly below the files list. Previously
   this information was always displayed on the bottom of the screen.

   https://github.com/owncloud/product/issues/120
   https://github.com/owncloud/web/pull/3849

* Change - Use pre-signed URLs in media viewer: [#3803](https://github.com/owncloud/web/pull/3803)

   We've started using pre-signed URLs if supported in media viewer to display images instead of
   fetching them.

   https://github.com/owncloud/web/pull/3803
   https://github.com/owncloud/web/pull/3844

* Change - Move quota indication to the left sidebar: [#121](https://github.com/owncloud/product/issues/121)

   We've moved the quota indication from the bottom of the files list to the footer of the left
   sidebar.

   https://github.com/owncloud/product/issues/121
   https://github.com/owncloud/web/pull/3849

* Change - Move docs about hugo usage to ocis: [#3828](https://github.com/owncloud/web/pull/3828)

   Since our documentation about how to work with hugo (for documentation) is a cross-extension
   topic, we have moved it to our main ocis docs.

   https://github.com/owncloud/web/pull/3828

* Change - Get rid of static "Shared with:" label: [#123](https://github.com/owncloud/product/issues/123)

   We removed the static "Shared with:" text label in the indicator row of file items. From now on,
   if a file item has no indicators, it will fall back to the one-row layout (resource name
   vertically centered).

   https://github.com/owncloud/product/issues/123
   https://github.com/owncloud/web/pull/3808

* Change - Large file downloads support with URL signing: [#3797](https://github.com/owncloud/web/pull/3797)

   When the backend supports URL signing we now download with a signed url instead of downloading
   as BLOB.

   https://github.com/owncloud/web/pull/3797

* Enhancement - Enable playing videos in media viewer: [#3803](https://github.com/owncloud/web/pull/3803)

   We've added a capability to the media viewer extension to play videos.

   https://github.com/owncloud/web/pull/3803
   https://github.com/owncloud/web/pull/3833
   https://github.com/owncloud/web/pull/3844
   https://github.com/owncloud/web/pull/3848

Changelog for ownCloud Web [0.13.0] (2020-07-17)
=======================================
The following sections list the changes in ownCloud web 0.13.0 relevant to
ownCloud admins and users.

[0.13.0]: https://github.com/owncloud/web/compare/v0.12.0...v0.13.0

Summary
-------

* Bugfix - Fix translations string: [#3766](https://github.com/owncloud/web/pull/3766)
* Enhancement - Add dev docs for releases: [#3186](https://github.com/owncloud/web/pull/3186)
* Enhancement - Enable changing sidebar logo via theming: [#3782](https://github.com/owncloud/web/issues/3782)

Details
-------

* Bugfix - Fix translations string: [#3766](https://github.com/owncloud/web/pull/3766)

   Allow better translations of various strings.

   https://github.com/owncloud/web/pull/3766
   https://github.com/owncloud/web/pull/3769

* Enhancement - Add dev docs for releases: [#3186](https://github.com/owncloud/web/pull/3186)

   We added documentation on the steps involved to release web.

   https://github.com/owncloud/web/pull/3186
   https://github.com/owncloud/web/pull/3767

* Enhancement - Enable changing sidebar logo via theming: [#3782](https://github.com/owncloud/web/issues/3782)

   We've added a key into the theme which enables using different logo in the sidebar.

   https://github.com/owncloud/web/issues/3782
   https://github.com/owncloud/web/pull/3783

Changelog for ownCloud Web [0.12.0] (2020-07-10)
=======================================
The following sections list the changes in ownCloud web 0.12.0 relevant to
ownCloud admins and users.

[0.12.0]: https://github.com/owncloud/web/compare/v0.11.2...v0.12.0

Summary
-------

* Bugfix - Fix navigation to the root folder from location picker: [#3756](https://github.com/owncloud/web/pull/3756)
* Change - Don't fallback to appId in case the route of file action is not defined: [#69](https://github.com/owncloud/product/issues/69)
* Change - Do not display outline when the files list is focused: [#3747](https://github.com/owncloud/web/issues/3747)
* Change - No file drop if upload is not allowed or no space is left: [#3677](https://github.com/owncloud/web/pull/3677)
* Enhancement - Add ability to copy files and folders into a different location: [#102](https://github.com/owncloud/product/issues/102)
* Enhancement - Add favorites capabilities: [#354](https://github.com/owncloud/ocis/issues/354)
* Enhancement - Add ability to move files and folders into a different location: [#101](https://github.com/owncloud/product/issues/101)

Details
-------

* Bugfix - Fix navigation to the root folder from location picker: [#3756](https://github.com/owncloud/web/pull/3756)

   The target location in the location picker was appending a whitespace when trying to go to root
   folder. This resulted in an error when trying to load such folder. We've removed the whitespace
   to fix the navigation.

   https://github.com/owncloud/web/pull/3756

* Change - Don't fallback to appId in case the route of file action is not defined: [#69](https://github.com/owncloud/product/issues/69)

   When opening a file in a editor or a viewer the path was falling back to an appId. This made it
   impossible to navigate via the file actions into an app which doesn't have duplicate appId in
   the route. We've stopped falling back to this value and in case that the route of the file action
   is not defined, we use the root path of the app.

   https://github.com/owncloud/product/issues/69
   https://github.com/owncloud/ocis/issues/356
   https://github.com/owncloud/web/pull/3740

* Change - Do not display outline when the files list is focused: [#3747](https://github.com/owncloud/web/issues/3747)

   The files list was displaying outline when it received focus after a click. Since the focus is
   meant only programatically, the outline was not supposed to be displayed.

   https://github.com/owncloud/web/issues/3747
   https://github.com/owncloud/web/issues/3551
   https://github.com/owncloud/web/pull/3752

* Change - No file drop if upload is not allowed or no space is left: [#3677](https://github.com/owncloud/web/pull/3677)

   https://github.com/owncloud/web/pull/3677

* Enhancement - Add ability to copy files and folders into a different location: [#102](https://github.com/owncloud/product/issues/102)

   We've added copy action to the files list. The copy action is executed via a new page called
   location picker.

   https://github.com/owncloud/product/issues/102
   https://github.com/owncloud/product/issues/108
   https://github.com/owncloud/web/pull/3749

* Enhancement - Add favorites capabilities: [#354](https://github.com/owncloud/ocis/issues/354)

   We've added a check of favorites capabilities to enable disabling of favorites list and
   favorite action.

   https://github.com/owncloud/ocis/issues/354
   https://github.com/owncloud/web/pull/3754

* Enhancement - Add ability to move files and folders into a different location: [#101](https://github.com/owncloud/product/issues/101)

   We've added move action to the files list which enables move of resources into different
   locations. The move operation is executed in a new page called Location picker.

   https://github.com/owncloud/product/issues/101
   https://github.com/owncloud/web/pull/3739

Changelog for ownCloud Web [0.11.2] (2020-07-03)
=======================================
The following sections list the changes in ownCloud web 0.11.2 relevant to
ownCloud admins and users.

[0.11.2]: https://github.com/owncloud/web/compare/v0.11.1...v0.11.2

Summary
-------

* Bugfix - Remove anchor on last breadcrumb segment: [#3722](https://github.com/owncloud/web/issues/3722)

Details
-------

* Bugfix - Remove anchor on last breadcrumb segment: [#3722](https://github.com/owncloud/web/issues/3722)

   The last segment of the breadcrumb was clickable, while it's expected that nothing happens (as
   it is the current path). We fixed that, the last breadcrumb element is not clickable anymore.

   https://github.com/owncloud/web/issues/3722
   https://github.com/owncloud/web/issues/2965
   https://github.com/owncloud/web/issues/1883
   https://github.com/owncloud/web/pull/3723

Changelog for ownCloud Web [0.11.1] (2020-06-29)
=======================================
The following sections list the changes in ownCloud web 0.11.1 relevant to
ownCloud admins and users.

[0.11.1]: https://github.com/owncloud/web/compare/v0.11.0...v0.11.1

Summary
-------

* Bugfix - Public upload now keeps modified time: [#3686](https://github.com/owncloud/web/pull/3686)
* Bugfix - Do not expand the width of resource name over it's content: [#3685](https://github.com/owncloud/web/issues/3685)
* Change - Use "Shared with" as a label for indicators: [#3688](https://github.com/owncloud/web/pull/3688)
* Enhancement - Update owncloud-sdk to 1.0.0-663: [#3690](https://github.com/owncloud/web/pull/3690)

Details
-------

* Bugfix - Public upload now keeps modified time: [#3686](https://github.com/owncloud/web/pull/3686)

   The public upload for public links now keeps the modification time of local files. This aligns
   the behavior with non-public file upload.

   https://github.com/owncloud/web/pull/3686

* Bugfix - Do not expand the width of resource name over it's content: [#3685](https://github.com/owncloud/web/issues/3685)

   The width of the resource name in the files list was expanded more than the actual width of it's
   content. This caused that when clicked outside of the resource name, the action to navigate or
   open the resource has been triggered instead of opening the sidebar. We've fixed the width that
   it is now equal to the width of the content.

   https://github.com/owncloud/web/issues/3685
   https://github.com/owncloud/web/pull/3687

* Change - Use "Shared with" as a label for indicators: [#3688](https://github.com/owncloud/web/pull/3688)

   Instead of "State" we've started using the "Shared with" as a label for the indicators in the
   files list. This is only intermediate solution because the indicators can be extended by other
   indicators which don't have to be related to sharing.

   https://github.com/owncloud/web/pull/3688

* Enhancement - Update owncloud-sdk to 1.0.0-663: [#3690](https://github.com/owncloud/web/pull/3690)

   We've updated the owncloud-sdk to version 1.0.0-663. This version stops rejecting sharing
   promises if the passed shareID is not an integer.

   https://github.com/owncloud/web/pull/3690

Changelog for ownCloud Web [0.11.0] (2020-06-26)
=======================================
The following sections list the changes in ownCloud web 0.11.0 relevant to
ownCloud admins and users.

[0.11.0]: https://github.com/owncloud/web/compare/v0.10.0...v0.11.0

Summary
-------

* Bugfix - Fix file type icons for uppercase file extensions: [#3670](https://github.com/owncloud/web/pull/3670)
* Bugfix - Fix empty settings values: [#3602](https://github.com/owncloud/web/pull/3602)
* Bugfix - Set default permissions to public link quick action: [#3675](https://github.com/owncloud/web/issues/3675)
* Bugfix - Set empty object when resetting current sidebar tab: [#3676](https://github.com/owncloud/web/issues/3676)
* Bugfix - Set expiration date only if it is supported: [#3674](https://github.com/owncloud/web/issues/3674)
* Bugfix - Add missing question mark to delete confirmation dialog in trashbin: [#3566](https://github.com/owncloud/web/pull/3566)
* Change - Bring new modal component: [#2263](https://github.com/owncloud/web/issues/2263)
* Change - Move create new button: [#3622](https://github.com/owncloud/web/pull/3622)
* Change - Move status indicators under the resource name: [#3617](https://github.com/owncloud/web/pull/3617)
* Change - Remove sidebar quickAccess: [#80](https://github.com/owncloud/product/issues/80)
* Change - Rework account dropdown: [#82](https://github.com/owncloud/product/issues/82)
* Change - Unite files list status indicators: [#3567](https://github.com/owncloud/web/pull/3567)
* Change - Use correct logo: [#786](https://github.com/owncloud/owncloud-design-system/issues/786)
* Enhancement - Send mtime with uploads: [#2969](https://github.com/owncloud/web/issues/2969)
* Enhancement - Use TUS settings from capabilities: [#177](https://github.com/owncloud/ocis-reva/issues/177)
* Enhancement - Add collaborators quick action: [#3573](https://github.com/owncloud/web/pull/3573)
* Enhancement - Dynamically loaded nav items: [#3497](https://github.com/owncloud/web/issues/3497)
* Enhancement - Load and display quick actions: [#3573](https://github.com/owncloud/web/pull/3573)

Details
-------

* Bugfix - Fix file type icons for uppercase file extensions: [#3670](https://github.com/owncloud/web/pull/3670)

   https://github.com/owncloud/web/pull/3670

* Bugfix - Fix empty settings values: [#3602](https://github.com/owncloud/web/pull/3602)

   We've updated owncloud-sdk to version 1.0.0-638 which makes sure that an empty array gets
   returned whenever there are no settings values for the authenticated user. Previously having
   no settings values broke our detection of whether settings values finished loading.

   https://github.com/owncloud/ocis-settings/issues/24
   https://github.com/owncloud/web/pull/3602

* Bugfix - Set default permissions to public link quick action: [#3675](https://github.com/owncloud/web/issues/3675)

   We've set a default permissions when creating a new public link via the quick actions. The
   permissions are set to `1`.

   https://github.com/owncloud/web/issues/3675
   https://github.com/owncloud/web/pull/3678

* Bugfix - Set empty object when resetting current sidebar tab: [#3676](https://github.com/owncloud/web/issues/3676)

   We've changed the argument from `null` to an empty object when resetting the current tab of the
   sidebar.

   https://github.com/owncloud/web/issues/3676
   https://github.com/owncloud/web/pull/3678

* Bugfix - Set expiration date only if it is supported: [#3674](https://github.com/owncloud/web/issues/3674)

   We've stopped setting expiration date in collaborators panel if it is not supported.

   https://github.com/owncloud/web/issues/3674
   https://github.com/owncloud/web/pull/3679

* Bugfix - Add missing question mark to delete confirmation dialog in trashbin: [#3566](https://github.com/owncloud/web/pull/3566)

   We've added missing question mark to the delete confirmation dialog inside of the trashbin.

   https://github.com/owncloud/web/pull/3566

* Change - Bring new modal component: [#2263](https://github.com/owncloud/web/issues/2263)

   We've updated our modal component with a new one coming from ODS.

   https://github.com/owncloud/web/issues/2263
   https://github.com/owncloud/web/pull/3378

* Change - Move create new button: [#3622](https://github.com/owncloud/web/pull/3622)

   We've moved the create new button in the files app bar to the left directly next to breadcrumbs.

   https://github.com/owncloud/web/pull/3622

* Change - Move status indicators under the resource name: [#3617](https://github.com/owncloud/web/pull/3617)

   We've moved the sharing status indicators from an own column in the files list to a second row
   under the resource name.

   https://github.com/owncloud/web/pull/3617

* Change - Remove sidebar quickAccess: [#80](https://github.com/owncloud/product/issues/80)

   We have removed the sidebar quickAccess extension point. To create an quick access to the
   sidebar, we need to use the quickActions extension point.

   https://github.com/owncloud/product/issues/80
   https://github.com/owncloud/web/pull/3586

* Change - Rework account dropdown: [#82](https://github.com/owncloud/product/issues/82)

   We've removed user avatar, user email and version from the account dropdown. The log out button
   has been changed into a link. All links in account dropdown are now inside of a list.

   https://github.com/owncloud/product/issues/82
   https://github.com/owncloud/web/pull/3605

* Change - Unite files list status indicators: [#3567](https://github.com/owncloud/web/pull/3567)

   We've merged direct and indirect status indicators in the files list. With this change, we
   focus on the important information of the indicator (e.g. resource is shared). Any additional
   information can then be displayed in the related tab of the sidebar.

   https://github.com/owncloud/web/pull/3567

* Change - Use correct logo: [#786](https://github.com/owncloud/owncloud-design-system/issues/786)

   We've changed the ownCloud logo which is used in the default theme. The previous logo had an
   incorrect font-weight.

   https://github.com/owncloud/owncloud-design-system/issues/786
   https://github.com/owncloud/web/pull/3604

* Enhancement - Send mtime with uploads: [#2969](https://github.com/owncloud/web/issues/2969)

   When uploading a file, the modification time is now sent along. This means that the uploaded
   file will have the same modification time like the one it had on disk. This aligns the behavior
   with the desktop client which also keeps the mtime.

   https://github.com/owncloud/web/issues/2969
   https://github.com/owncloud/web/pull/3377

* Enhancement - Use TUS settings from capabilities: [#177](https://github.com/owncloud/ocis-reva/issues/177)

   The TUS settings advertise the maximum chunk size, so we now use the smallest chunk size from the
   one configured in config.json and the one from the capabilities.

   If the capabilities report that one should use the X-HTTP-Override-Method header, the upload
   will now use a POST request for uploads with that header set instead of PATCH.

   https://github.com/owncloud/ocis-reva/issues/177
   https://github.com/owncloud/web/pull/3568

* Enhancement - Add collaborators quick action: [#3573](https://github.com/owncloud/web/pull/3573)

   We've added a new quick action which opens the new collaborators tab in the files list sidebar.

   https://github.com/owncloud/web/pull/3573

* Enhancement - Dynamically loaded nav items: [#3497](https://github.com/owncloud/web/issues/3497)

   We have moved the navItems from application configuration into a store module. We extended
   it's functionality by introducing statically and dynamically loaded navItems. This way
   navItems can be loaded based on extension data, as soon as the extension becomes active. Please
   note that having at least one static navItem (coming from the appInfo object of an extension) is
   still a requirement for the extension appearing in the app switcher.

   https://github.com/owncloud/web/issues/3497
   https://github.com/owncloud/web/pull/3570

* Enhancement - Load and display quick actions: [#3573](https://github.com/owncloud/web/pull/3573)

   We've added an extension point into files apps for quick actions. By creating and exporting an
   object called quickActions, developers can define an action which will be then displayed in
   the files list.

   https://github.com/owncloud/web/pull/3573

Changelog for ownCloud Web [0.10.0] (2020-05-26)
=======================================
The following sections list the changes in ownCloud web 0.10.0 relevant to
ownCloud admins and users.

[0.10.0]: https://github.com/owncloud/web/compare/v0.9.0...v0.10.0

Summary
-------

* Bugfix - Fix share indicators click to open the correct panel: [#3324](https://github.com/owncloud/web/issues/3324)
* Bugfix - Set server config to ocis proxy in example config file: [#3454](https://github.com/owncloud/web/pull/3454)
* Change - Removed favorite button from file list and added it in the sidebar: [#1987](https://github.com/owncloud/web/issues/1987)
* Change - Make settings available in web: [#3484](https://github.com/owncloud/web/pull/3484)
* Change - Use language setting: [#3484](https://github.com/owncloud/web/pull/3484)
* Change - Permanently visible branded left navigation sidebar: [#3395](https://github.com/owncloud/web/issues/3395)

Details
-------

* Bugfix - Fix share indicators click to open the correct panel: [#3324](https://github.com/owncloud/web/issues/3324)

   When clicking on a share indicator inside a file list row, the correct share panel will now be
   displayed.

   https://github.com/owncloud/web/issues/3324
   https://github.com/owncloud/web/pull/3420

* Bugfix - Set server config to ocis proxy in example config file: [#3454](https://github.com/owncloud/web/pull/3454)

   We fixed the ocis example config to point to the default oCIS Proxy address instead of the
   default Web service address.

   https://github.com/owncloud/web/pull/3454

* Change - Removed favorite button from file list and added it in the sidebar: [#1987](https://github.com/owncloud/web/issues/1987)

   We've removed the favorite star button in the file list and added instead a functionality to the
   before non-working star button in the file's sidebar. We also added a new action in the file
   action dropdown menu which allows you to toggle the favorite status of your file.

   https://github.com/owncloud/web/issues/1987
   https://github.com/owncloud/web/pull/3336

* Change - Make settings available in web: [#3484](https://github.com/owncloud/web/pull/3484)

   We upgraded to a new owncloud-sdk version which provides loading settings from the settings
   service, if available. The settings values are available throughout web and all extensions.

   https://github.com/owncloud/web/pull/3484

* Change - Use language setting: [#3484](https://github.com/owncloud/web/pull/3484)

   We've changed web to make use of the language the authenticated user has chosen in the settings.

   https://github.com/owncloud/web/pull/3484

* Change - Permanently visible branded left navigation sidebar: [#3395](https://github.com/owncloud/web/issues/3395)

   We've made left navigation sidebar permanently visible and moved branding (logo and brand
   color) into it.

   https://github.com/owncloud/web/issues/3395
   https://github.com/owncloud/web/pull/3442

Changelog for ownCloud Web [0.9.0] (2020-04-27)
=======================================
The following sections list the changes in ownCloud web 0.9.0 relevant to
ownCloud admins and users.

[0.9.0]: https://github.com/owncloud/web/compare/v0.8.0...v0.9.0

Summary
-------

* Bugfix - Remove deleted files from search result: [#3266](https://github.com/owncloud/web/pull/3266)
* Bugfix - Show token string if link name is empty in FileLinkSidebar: [#3297](https://github.com/owncloud/web/pull/3297)
* Bugfix - Remove duplicate error display in input prompt: [#3342](https://github.com/owncloud/web/pull/3342)
* Bugfix - Fix translation message extraction from plain javascript files: [#3346](https://github.com/owncloud/web/pull/3346)
* Bugfix - Fix name of selected extension on broken apps: [#3376](https://github.com/owncloud/web/pull/3376)
* Change - Update owncloud-sdk: [#3369](https://github.com/owncloud/web/pull/3369)
* Enhancement - Add chunked upload with tus-js-client: [#67](https://github.com/owncloud/web/issues/67)

Details
-------

* Bugfix - Remove deleted files from search result: [#3266](https://github.com/owncloud/web/pull/3266)

   Deleted file has been removed from filesSearched state by adding a new mutation. Also, filter
   condition in remove file mutations has been changed from object reference to unique file id.

   https://github.com/owncloud/web/issues/3043
   https://github.com/owncloud/web/issues/3044
   https://github.com/owncloud/web/pull/3266

* Bugfix - Show token string if link name is empty in FileLinkSidebar: [#3297](https://github.com/owncloud/web/pull/3297)

   Owncloud-js-client was parsing empty link name xml attribute as empty object. The empty
   object was changed with an empty string. Also, FileLinkSidebar behaviour fixed by showing
   token as name for the link shares without a name.

   https://github.com/owncloud/web/issues/2517
   https://github.com/owncloud/web/pull/3297

* Bugfix - Remove duplicate error display in input prompt: [#3342](https://github.com/owncloud/web/pull/3342)

   Validation errors within the input prompt dialog were showing up twice. One of them is a
   leftover from the old version. We've fixed the dialog by removing the old validation error
   type.

   https://github.com/owncloud/web/pull/3342

* Bugfix - Fix translation message extraction from plain javascript files: [#3346](https://github.com/owncloud/web/pull/3346)

   https://github.com/Polyconseil/easygettext/issues/81
   https://github.com/owncloud/web/pull/3346

* Bugfix - Fix name of selected extension on broken apps: [#3376](https://github.com/owncloud/web/pull/3376)

   With the edge case of a broken app in config.json, the top bar is broken, because appInfo can't be
   loaded. We made ocis-web more robust by just showing the extension id in the top bar when the
   appInfo is not available.

   https://github.com/owncloud/web/pull/3376

* Change - Update owncloud-sdk: [#3369](https://github.com/owncloud/web/pull/3369)

   Updated owncloud-sdk to v1.0.0-604

   https://github.com/owncloud/web/pull/3369

* Enhancement - Add chunked upload with tus-js-client: [#67](https://github.com/owncloud/web/issues/67)

   Whenever the backend server advertises TUS support, uploading files will use TUS as well for
   uploading, which makes it possible to resume failed uploads. It is also possible to optionally
   set a chunk size by setting a numeric value for "uploadChunkSize" in bytes in config.json.

   https://github.com/owncloud/web/issues/67
   https://github.com/owncloud/web/pull/3345

Changelog for ownCloud Web [0.8.0] (2020-04-14)
=======================================
The following sections list the changes in ownCloud web 0.8.0 relevant to
ownCloud admins and users.

[0.8.0]: https://github.com/owncloud/web/compare/v0.7.0...v0.8.0

Summary
-------

* Bugfix - Display errors when saving collaborator fails: [#3176](https://github.com/owncloud/web/issues/3176)
* Bugfix - Fix media-viewer on private pages: [#3288](https://github.com/owncloud/web/pull/3288)
* Bugfix - Fix oidc redirect after logout: [#3285](https://github.com/owncloud/web/issues/3285)
* Bugfix - Update owncloud-sdk 1.0.0-544: [#3292](https://github.com/owncloud/web/pull/3292)
* Bugfix - Set a higher timeout for requirejs: [#3293](https://github.com/owncloud/web/pull/3293)
* Enhancement - Visual improvement to errors in input prompts: [#1906](https://github.com/owncloud/web/issues/1906)
* Enhancement - Add state to app urls: [#3294](https://github.com/owncloud/web/pull/3294)

Details
-------

* Bugfix - Display errors when saving collaborator fails: [#3176](https://github.com/owncloud/web/issues/3176)

   When saving a collaborator has failed, the UI was still behaving like it saved everything
   successfully. This has been fixed by displaying the errors at the top of the collaborator
   editing form and staying in the editing view.

   https://github.com/owncloud/web/issues/3176
   https://github.com/owncloud/web/pull/3241

* Bugfix - Fix media-viewer on private pages: [#3288](https://github.com/owncloud/web/pull/3288)

   Media-viewer incorrectly assumed it was on a public page when opened from a private page.

   https://github.com/owncloud/web/pull/3288

* Bugfix - Fix oidc redirect after logout: [#3285](https://github.com/owncloud/web/issues/3285)

   After the logout the idp sent a redirect to `<redirectUri>?state=` which was then redirected
   to `<redirectUri>?state=#/login` by web. Having the query parameters in between broke the
   application. To prevent the whole login url `<baseUrl>#/login` should be sent then the query
   parameter will be appended to the end.

   https://github.com/owncloud/web/issues/3285

* Bugfix - Update owncloud-sdk 1.0.0-544: [#3292](https://github.com/owncloud/web/pull/3292)

   This sdk version is much smaller in size

   https://github.com/owncloud/web/pull/3292

* Bugfix - Set a higher timeout for requirejs: [#3293](https://github.com/owncloud/web/pull/3293)

   In slow networks requirejs requests can timeout. The timeout is now set to a higher value (200
   secs)

   https://github.com/owncloud/web/pull/3293

* Enhancement - Visual improvement to errors in input prompts: [#1906](https://github.com/owncloud/web/issues/1906)

   We've adjusted the input prompts to show a visually less prominent text below the input field.
   Also, error messages now appear with a small delay, so that those happening during typing get
   ignored (e.g. trailing whitespace is not allowed in folder names and previously caused an
   error to show on every typed blank).

   https://github.com/owncloud/web/issues/1906
   https://github.com/owncloud/web/pull/3240

* Enhancement - Add state to app urls: [#3294](https://github.com/owncloud/web/pull/3294)

   Currently opened file can be added to app routes so reloading the page can be made to work For now
   it's only implemented in mediaviewer

   https://github.com/owncloud/web/pull/3294

Changelog for ownCloud Web [0.7.0] (2020-03-30)
=======================================
The following sections list the changes in ownCloud web 0.7.0 relevant to
ownCloud admins and users.

[0.7.0]: https://github.com/owncloud/web/compare/v0.6.0...v0.7.0

Summary
-------

* Bugfix - Fix logout when no tokens are known anymore: [#2961](https://github.com/owncloud/web/pull/2961)
* Bugfix - Files list status indicators are now appearing without any delay: [#2973](https://github.com/owncloud/web/issues/2973)
* Bugfix - Fix file actions menu when using OCIS backend: [#3214](https://github.com/owncloud/web/issues/3214)
* Bugfix - Do not remove first character of etag: [#3274](https://github.com/owncloud/web/pull/3274)
* Change - Don't import whole core-js bundle directly into core: [#3173](https://github.com/owncloud/web/pull/3173)
* Enhancement - Added thumbnails in file list: [#276](https://github.com/owncloud/web/issues/276)

Details
-------

* Bugfix - Fix logout when no tokens are known anymore: [#2961](https://github.com/owncloud/web/pull/2961)

   Single Log Out requires the id_token and in cases where this token is no longer known calling the
   SLO endpoint will result in an error.

   This has been fixed.

   https://github.com/owncloud/web/pull/2961

* Bugfix - Files list status indicators are now appearing without any delay: [#2973](https://github.com/owncloud/web/issues/2973)

   We've stopped loading file list status indicators asynchronously to prevent them from
   appearing delayed. They appear now at the same time as the file list.

   https://github.com/owncloud/web/issues/2973
   https://github.com/owncloud/web/pull/3213

* Bugfix - Fix file actions menu when using OCIS backend: [#3214](https://github.com/owncloud/web/issues/3214)

   When using OCIS as backend, the ids of resources is a string instead of integer. So we cannot
   embed those into DOM node ids and need to use another alternative. This fix introduces a unique
   viewId which is only there to provide uniqueness across the current list and should not be used
   for any data related operation.

   This fixes the file actions menu when using OCIS as backend.

   https://github.com/owncloud/web/issues/3214
   https://github.com/owncloud/ocis-web/issues/51

* Bugfix - Do not remove first character of etag: [#3274](https://github.com/owncloud/web/pull/3274)

   When stripping away double quotes in etag of the file thumbnails, we accidentally removed
   first character as well. We've stopped removing that character.

   https://github.com/owncloud/web/pull/3274

* Change - Don't import whole core-js bundle directly into core: [#3173](https://github.com/owncloud/web/pull/3173)

   We've stopped importing whole core-js bundle directly into core and instead load only used
   parts with babel.

   https://github.com/owncloud/web/pull/3173

* Enhancement - Added thumbnails in file list: [#276](https://github.com/owncloud/web/issues/276)

   Thumbnails are now displayed in the file list for known file types. When no thumbnail was
   returned, fall back to the file type icon.

   https://github.com/owncloud/web/issues/276
   https://github.com/owncloud/web/pull/3187

Changelog for ownCloud Web [0.6.0] (2020-03-16)
=======================================
The following sections list the changes in ownCloud web 0.6.0 relevant to
ownCloud admins and users.

[0.6.0]: https://github.com/owncloud/web/compare/v0.5.0...v0.6.0

Summary
-------

* Bugfix - Indirect share info now visible in favorite and other file lists: [#3040](https://github.com/owncloud/web/issues/3040)
* Bugfix - Fixed layout of file lists: [#3100](https://github.com/owncloud/web/pull/3100)
* Bugfix - Changed share icons to collaborators icons: [#3116](https://github.com/owncloud/web/pull/3116)
* Bugfix - Sorted collaborators column, deduplicate public entry: [#3137](https://github.com/owncloud/web/issues/3137)
* Bugfix - Use end of the day in expiration date: [#3158](https://github.com/owncloud/web/pull/3158)
* Change - Moved collaborators additional info on own row and removed type row: [#3130](https://github.com/owncloud/web/pull/3130)
* Change - New sort order for collaborators and public links: [#3136](https://github.com/owncloud/web/pull/3136)
* Change - Stop support for deployment of Web as an ownCloud app: [#3162](https://github.com/owncloud/web/pull/3162)
* Change - Align columns in file lists to the right: [#3036](https://github.com/owncloud/web/issues/3036)
* Enhancement - Expiration date for collaborators: [#2543](https://github.com/owncloud/web/issues/2543)

Details
-------

* Bugfix - Indirect share info now visible in favorite and other file lists: [#3040](https://github.com/owncloud/web/issues/3040)

   When open the share panel of other flat file lists like the favorites, the collaborators list
   and link list are now showing the same entries like in the "All files" list, which includes
   indirect shares (via) that were previously missing.

   https://github.com/owncloud/web/issues/3040
   https://github.com/owncloud/web/pull/3135

* Bugfix - Fixed layout of file lists: [#3100](https://github.com/owncloud/web/pull/3100)

   A recent library update in ODS for the recycle scroller seem to have changed the logic or
   calculation of the height.

   This fix accomodates for that change and restores the row height to a correct value.

   The shared file lists are now more responsive, the collaborators/owner and share time columns
   are now hidden on small screens.

   https://github.com/owncloud/web/pull/3100

* Bugfix - Changed share icons to collaborators icons: [#3116](https://github.com/owncloud/web/pull/3116)

   Adjust icon in files app navigation bar and also in the file actions dropdown to use the group
   icon.

   https://github.com/owncloud/web/pull/3116

* Bugfix - Sorted collaborators column, deduplicate public entry: [#3137](https://github.com/owncloud/web/issues/3137)

   The collaborators column that appears in the "shared with others" section are now sorted:
   first by share type (user, group, link, remote) and then by display name using natural sort.
   Additionally, if there is more than one public link for the resource, the text "Public" only
   appears once in the collaborators column.

   https://github.com/owncloud/web/issues/3137
   https://github.com/owncloud/web/pull/3171

* Bugfix - Use end of the day in expiration date: [#3158](https://github.com/owncloud/web/pull/3158)

   We've changed the expiration date field in the collaborators list to the end of the day.

   https://github.com/owncloud/web/pull/3158

* Change - Moved collaborators additional info on own row and removed type row: [#3130](https://github.com/owncloud/web/pull/3130)

   We've moved collaborators additional info on own row under the name of collaborator and
   removed collaborator type row.

   https://github.com/owncloud/web/pull/3130

* Change - New sort order for collaborators and public links: [#3136](https://github.com/owncloud/web/pull/3136)

   We've changed the sort order for collaborators and public links. Collaborators are now sorted
   by: collaborator type, is collaborator direct, display name and creation date. Public links
   are now sorted by: is public link direct, display name and creation date.

   https://github.com/owncloud/web/pull/3136

* Change - Stop support for deployment of Web as an ownCloud app: [#3162](https://github.com/owncloud/web/pull/3162)

   We've stopped supporting deployment of Web as an ownCloud app. In the release is no longer
   available Web ownCloud 10 app package.

   https://github.com/owncloud/web/pull/3162

* Change - Align columns in file lists to the right: [#3036](https://github.com/owncloud/web/issues/3036)

   We've aligned columns in all file lists to the right so it is easier for the user to compare them.

   https://github.com/owncloud/web/issues/3036
   https://github.com/owncloud/web/pull/3163

* Enhancement - Expiration date for collaborators: [#2543](https://github.com/owncloud/web/issues/2543)

   We've added an expiration date for collaborators. Users can choose an expiration date for
   users and groups. After the date is reached the collaborator is automatically removed. Admins
   can set default expiration date or enforce it.

   https://github.com/owncloud/web/issues/2543
   https://github.com/owncloud/web/pull/3086

Changelog for ownCloud Web [0.5.0] (2020-03-02)
=======================================
The following sections list the changes in ownCloud web 0.5.0 relevant to
ownCloud admins and users.

[0.5.0]: https://github.com/owncloud/web/compare/v0.4.0...v0.5.0

Summary
-------

* Bugfix - Various fixes for files app in responsive mode: [#2998](https://github.com/owncloud/web/issues/2998)
* Bugfix - Responsive buttons layout in app bar when multiple files are selected: [#3011](https://github.com/owncloud/web/issues/3011)
* Bugfix - Fix accessible labels that said $gettext: [#3039](https://github.com/owncloud/web/pull/3039)
* Bugfix - Fix console warning about search query in public page: [#3041](https://github.com/owncloud/web/pull/3041)
* Bugfix - Moved resharers to the top of owner collaborator entry: [#3850](https://github.com/owncloud/web/issues/3850)
* Change - Moved sidebar navigation under top bar: [#3077](https://github.com/owncloud/web/pull/3077)
* Enhancement - Added ability to click file list columns for sorting: [#1854](https://github.com/owncloud/web/issues/1854)
* Enhancement - Improved collaborators column in shared file lists: [#2924](https://github.com/owncloud/web/issues/2924)
* Enhancement - Display decimals in resource size column only for MBs or higher: [#2986](https://github.com/owncloud/web/issues/2986)
* Enhancement - Different message in overwrite dialog when versioning is enabled: [#3047](https://github.com/owncloud/web/issues/3047)
* Enhancement - Current user entry in collaborators list in sidebar: [#3808](https://github.com/owncloud/web/issues/3808)

Details
-------

* Bugfix - Various fixes for files app in responsive mode: [#2998](https://github.com/owncloud/web/issues/2998)

   Fixed properly alignment of header columns with the body of the files table which stays even
   after resizing. Removed the column label for the actions column as it looks nicer.

   https://github.com/owncloud/web/issues/2998
   https://github.com/owncloud/web/pull/2999

* Bugfix - Responsive buttons layout in app bar when multiple files are selected: [#3011](https://github.com/owncloud/web/issues/3011)

   We've fixed the responsive buttons layout in files app bar when multiple files are selected
   where bulk actions where overlapping and height of the buttons was increased.

   https://github.com/owncloud/web/issues/3011
   https://github.com/owncloud/web/pull/3083

* Bugfix - Fix accessible labels that said $gettext: [#3039](https://github.com/owncloud/web/pull/3039)

   Fixed three accessible aria labels that were saying "$gettext" instead of their actual
   translated text.

   https://github.com/owncloud/web/pull/3039

* Bugfix - Fix console warning about search query in public page: [#3041](https://github.com/owncloud/web/pull/3041)

   Fixed console warning about the search query attribute not being available whenever the
   search fields are not visible, for example when accessing a public link page.

   https://github.com/owncloud/web/pull/3041

* Bugfix - Moved resharers to the top of owner collaborator entry: [#3850](https://github.com/owncloud/web/issues/3850)

   For received shares, the resharers user display names are now shown on top of the owner entry in
   the collaborators list, with a reshare icon, instead of having their own entry in the
   collaborators list.

   This makes the reshare situation more clear and removes the ambiguity about the formerly
   displayed "resharer" role which doesn't exist.

   https://github.com/owncloud/web/issues/3850

* Change - Moved sidebar navigation under top bar: [#3077](https://github.com/owncloud/web/pull/3077)

   We've adjusted the position of the sidebar navigation to be under the top bar.

   https://github.com/owncloud/web/pull/3077

* Enhancement - Added ability to click file list columns for sorting: [#1854](https://github.com/owncloud/web/issues/1854)

   The sorting mode of the file list can now be changed by clicking on the column headers.

   https://github.com/owncloud/web/issues/1854

* Enhancement - Improved collaborators column in shared file lists: [#2924](https://github.com/owncloud/web/issues/2924)

   Fixed issue with the collaborators column where only one was being displayed in the "shared
   with you" file list. This is done by properly aggregating all share entries under each file
   entry for the list, which now also includes group shares and link shares.

   Improved the look of the collaborators by adding avatars and icons there for the shares in the
   collaborators and owner columns.

   https://github.com/owncloud/web/issues/2924
   https://github.com/owncloud/web/pull/3049

* Enhancement - Display decimals in resource size column only for MBs or higher: [#2986](https://github.com/owncloud/web/issues/2986)

   We've stopped displaying decimals in resource size column for sizes smaller than 1 MB. We've
   also started displaying only one decimal.

   https://github.com/owncloud/web/issues/2986
   https://github.com/owncloud/web/pull/3051

* Enhancement - Different message in overwrite dialog when versioning is enabled: [#3047](https://github.com/owncloud/web/issues/3047)

   We've added a new message in the overwrite dialog when versioning is enabled. This message is
   intended to make it clear that the resource won't be overwritten but a new version of it will be
   created.

   https://github.com/owncloud/web/issues/3047
   https://github.com/owncloud/web/pull/3050

* Enhancement - Current user entry in collaborators list in sidebar: [#3808](https://github.com/owncloud/web/issues/3808)

   We've added a new entry into the collaborators list in sidebar which contains current user.

   https://github.com/owncloud/web/issues/3808
   https://github.com/owncloud/web/pull/3060

Changelog for ownCloud Web [0.4.0] (2020-02-14)
=======================================
The following sections list the changes in ownCloud web 0.4.0 relevant to
ownCloud admins and users.

[0.4.0]: https://github.com/owncloud/web/compare/v0.3.0...v0.4.0

Summary
-------

* Bugfix - Fix collaborator selection on new collaborator shares: [#1186](https://github.com/owncloud/web/issues/1186)
* Bugfix - Prevent loader in sidebar on add/remove: [#2937](https://github.com/owncloud/web/issues/2937)
* Bugfix - Fix issue with translate function for pending shares: [#3012](https://github.com/owncloud/web/issues/3012)
* Bugfix - Properly manage escaping of all translations: [#3032](https://github.com/owncloud/web/pull/3032)
* Change - Improve UI/UX of collaborator forms: [#1186](https://github.com/owncloud/web/issues/1186)
* Change - Display only items for current extension in sidebar menu: [#2746](https://github.com/owncloud/web/issues/2746)
* Change - Removed filter button in files list header: [#2971](https://github.com/owncloud/web/issues/2971)
* Change - File actions now always behind three dots button: [#2974](https://github.com/owncloud/web/pull/2974)
* Change - Improve ownCloud Design System (ODS): [#2989](https://github.com/owncloud/web/issues/2989)
* Change - Improve visual appearance of upload progress: [#3742](https://github.com/owncloud/enterprise/issues/3742)
* Enhancement - Add empty folder message in file list views: [#1910](https://github.com/owncloud/web/issues/1910)
* Enhancement - Fixed header for files tables: [#1952](https://github.com/owncloud/web/issues/1952)

Details
-------

* Bugfix - Fix collaborator selection on new collaborator shares: [#1186](https://github.com/owncloud/web/issues/1186)

   When typing text into the search box for new collaborators, selecting a user and a group with
   identical names was not possible. This was due to the fact that when one (group or user) got
   selected, the other was excluded because of a matching name. Fixed by including the share type
   (group or user) in matching.

   https://github.com/owncloud/web/issues/1186

* Bugfix - Prevent loader in sidebar on add/remove: [#2937](https://github.com/owncloud/web/issues/2937)

   When adding or removing a public link or collaborator, the respective list view sidebar panels
   briefly hid the panel and showed a loader instead. The UI is supposed to show a visual transition
   of a new list item into the list on adding, as well as a visual transition out of the list on
   deletion. This is fixed now by not triggering the loading state on add and remove actions
   anymore. A loading state is only meant to appear when the user navigates to the shares of another
   file/folder.

   https://github.com/owncloud/web/issues/2937
   https://github.com/owncloud/web/pull/2952

* Bugfix - Fix issue with translate function for pending shares: [#3012](https://github.com/owncloud/web/issues/3012)

   The pending shares was wrongly passing in a translation function, which caused translations
   to be missing in the error message but also it broke the general translation sync process with
   Transifex. Thanks to this change the translations will be up to date again.

   https://github.com/owncloud/web/issues/3012
   https://github.com/owncloud/web/pull/3014

* Bugfix - Properly manage escaping of all translations: [#3032](https://github.com/owncloud/web/pull/3032)

   We've stopped escaping translations which contained resource names or user names because
   they can contain special characters which were then not properly displayed. We've done this
   only with translations which are using mustache syntax which does escaping on its own so we
   don't introduce poteintial XSS vulnerability. For all other translations, we've explicitly
   set the escaping.

   https://github.com/owncloud/web/pull/3032

* Change - Improve UI/UX of collaborator forms: [#1186](https://github.com/owncloud/web/issues/1186)

   Applied several UI/UX improvements to the collaborator forms (adding and editing). - Showing
   avatars for selected collaborators on a new share and fixed styling/layouting of said
   collaborators in the list. - Added sensible margins on text about missing permissions for
   re-sharing in the sharing sidebar. - Fixed alignment of displayed collaborator in editing
   view for collaborators. - Removed separators from the forms that were cluttering the view. -
   Moved role description on role selection (links and collaborators) into the form element. Not
   shown below the form element anymore.

   https://github.com/owncloud/web/issues/1186

* Change - Display only items for current extension in sidebar menu: [#2746](https://github.com/owncloud/web/issues/2746)

   We've filtered out nav items in the sidebar menu. Now only items for current extension will be
   displayed. In case the extension has only one nav item, the sidebar menu is hidden and instead of
   menu button is displayed the name of extension.

   https://github.com/owncloud/web/issues/2746
   https://github.com/owncloud/web/pull/3013

* Change - Removed filter button in files list header: [#2971](https://github.com/owncloud/web/issues/2971)

   Removed the confusing filter button in the files list header, so the following are now removed
   as well: - ability to toggle files and folders visibility which wasn't that useful and not
   really a requirement - filter text box as it is is redundant as one can already use the global
   search box - ability to hide dot files, we'll look into providing this again in the future with an
   improved UI

   https://github.com/owncloud/web/issues/2971

* Change - File actions now always behind three dots button: [#2974](https://github.com/owncloud/web/pull/2974)

   The inline file actions button didn't look very nice and made the UI look cluttered. This change
   hides them behind a three dots button on the line, the same that was already visible in
   responsive mode. The three dots button also now has no more border and looks nicer.

   https://github.com/owncloud/web/issues/2998
   https://github.com/owncloud/web/pull/2974

* Change - Improve ownCloud Design System (ODS): [#2989](https://github.com/owncloud/web/issues/2989)

   During the work on this release, there have been several changes in ODS which directly affect
   Web. - Proper text truncate in breadcrumb component. This fixes the mobile view of the current
   folder breadcrumb in the top bar. - New icon sizes `xlarge` and `xxlarge` in oc-icon component.
   Those are used for the `No content` messages e.g. when navigating to an empty folder. - Provide
   new icon size `xsmall` and align spinner-sizes with icon-sizes. The `xsmall` icon size turned
   out to be prettier in some places. The size alignments fixed layout glitches when removing
   collaborators or public links. - Fix aria label on spinner in oc-autocomplete. Warning were
   cluttering the JavaScript console when adding collaborators. - Reset input on selection in
   oc-autocomplete, when `fillOnSelection=false`. This makes sure that when a new
   collaborator has been selected, the search input field goes back to being blank for a new
   search.

   https://github.com/owncloud/web/issues/2989
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

* Enhancement - Add empty folder message in file list views: [#1910](https://github.com/owncloud/web/issues/1910)

   Whenever a folder contains no entries in any of the file list views, a message is now shown
   indicating that the folder is empty, or that there are no favorites, etc.

   https://github.com/owncloud/web/issues/1910
   https://github.com/owncloud/web/pull/2975

* Enhancement - Fixed header for files tables: [#1952](https://github.com/owncloud/web/issues/1952)

   We've made the header of files tables fixed so it is easier to know the meaning of table columns.

   https://github.com/owncloud/web/issues/1952
   https://github.com/owncloud/web/pull/2995

Changelog for ownCloud Web [0.3.0] (2020-01-31)
=======================================
The following sections list the changes in ownCloud web 0.3.0 relevant to
ownCloud admins and users.

[0.3.0]: https://github.com/owncloud/web/compare/v0.2.7...v0.3.0

Summary
-------

* Bugfix - Transform route titles into real h1 headings: [#2681](https://github.com/owncloud/web/pull/2681)
* Bugfix - Prevent jumpy behavior when loading user avatars: [#2921](https://github.com/owncloud/web/issues/2921)
* Change - Bring UI/UX of file links sidebar in line with sharing sidebar: [#1907](https://github.com/owncloud/web/issues/1907)
* Change - Join users and groups into a single list in collaborators sidebar: [#2900](https://github.com/owncloud/web/issues/2900)
* Change - Adjusted labels in files list: [#2902](https://github.com/owncloud/web/pull/2902)
* Enhancement - Add share indicator for direct and indirect shares in file list: [#2060](https://github.com/owncloud/web/issues/2060)
* Enhancement - Add files list status indicators extension point: [#2895](https://github.com/owncloud/web/issues/2895)
* Enhancement - Add theme option to disable default files list status indicators: [#2895](https://github.com/owncloud/web/issues/2895)
* Enhancement - Show indirect outgoing shares in shares panel: [#2897](https://github.com/owncloud/web/issues/2897)
* Enhancement - Add owner and resharer in collaborators list: [#2898](https://github.com/owncloud/web/issues/2898)

Details
-------

* Bugfix - Transform route titles into real h1 headings: [#2681](https://github.com/owncloud/web/pull/2681)

   We transformed spans that held the page title to h1 elements. In the case of the file list, a h1 is
   existing for accessibility reasons but can only be perceived via a screen reader.

   https://github.com/owncloud/web/pull/2681

* Bugfix - Prevent jumpy behavior when loading user avatars: [#2921](https://github.com/owncloud/web/issues/2921)

   When loading a user avatar, the container size was smaller so as soon as the avatar was loaded, it
   resulted in jumpy behavior. This is fixed now by applying the same size to the loading spinner
   element.

   https://github.com/owncloud/web/issues/2921
   https://github.com/owncloud/web/pull/2927

* Change - Bring UI/UX of file links sidebar in line with sharing sidebar: [#1907](https://github.com/owncloud/web/issues/1907)

   We adapted the UI/UX of the file links sidebar to be in line with the UI/UX of the collaborators
   sidebar. The order of the two sidebars has been reversed (collaborators first, file links
   second). We added info messages to support a clear understanding of the purpose of both private
   and public links. Most notably the file links sidebar has no inline forms anymore.

   https://github.com/owncloud/web/issues/1907
   https://github.com/owncloud/web/issues/1307
   https://github.com/owncloud/web/pull/2841
   https://github.com/owncloud/web/pull/2917

* Change - Join users and groups into a single list in collaborators sidebar: [#2900](https://github.com/owncloud/web/issues/2900)

   Users and groups were shown as two separate lists (users, then groups) in the collaborators
   sidebar. This separation is now removed, i.e. there is only one list with all collaborators,
   sorted by display name (lower case, ascending). On equal names groups are shown first.

   https://github.com/owncloud/web/issues/2900

* Change - Adjusted labels in files list: [#2902](https://github.com/owncloud/web/pull/2902)

   Renamed "Modification time" to "Updated" to make it look less technical. Replace "Create new"
   with "New" in the "New" menu as it makes it look less cluttered when trying to spot a matching
   entry.

   https://github.com/owncloud/web/pull/2902
   https://github.com/owncloud/web/pull/2905

* Enhancement - Add share indicator for direct and indirect shares in file list: [#2060](https://github.com/owncloud/web/issues/2060)

   We've added the ability for the user to directly see whether a resource is shared in the file
   list. For this, share indicators in the form of a group icon and link icon will appear in a new
   column near the shared resource. The blue color of an icon tells whether outgoing shares exist
   directly on the resource. The grey color of an icon tells that incoming or outgoing shares exist
   on any of the parent folders.

   https://github.com/owncloud/web/issues/2060
   https://github.com/owncloud/web/issues/2894
   https://github.com/owncloud/web/pull/2877

* Enhancement - Add files list status indicators extension point: [#2895](https://github.com/owncloud/web/issues/2895)

   We've added the ability for the extension to inject custom status indicator into files list.
   New indicators will then appear next to the default one.

   https://github.com/owncloud/web/issues/2895
   https://github.com/owncloud/web/pull/2928

* Enhancement - Add theme option to disable default files list status indicators: [#2895](https://github.com/owncloud/web/issues/2895)

   We've added the option into the theme to disable default files list status indicators.

   https://github.com/owncloud/web/issues/2895
   https://github.com/owncloud/web/pull/2928

* Enhancement - Show indirect outgoing shares in shares panel: [#2897](https://github.com/owncloud/web/issues/2897)

   Whenever outgoing shares exist on any parent resource from the currently viewed resource, the
   shares panel will now show these outgoing shares with a link to jump to the matching parent
   resource. This applies to both indirect collaborators shares and also to indirect public link
   shares.

   https://github.com/owncloud/web/issues/2897
   https://github.com/owncloud/web/pull/2929
   https://github.com/owncloud/web/pull/2932

* Enhancement - Add owner and resharer in collaborators list: [#2898](https://github.com/owncloud/web/issues/2898)

   The top of the collaborators list now display new entries for the resource owner and the
   resharer when applicable, and also visible when viewing a child resource of a shared folder
   (indirect share).

   https://github.com/owncloud/web/issues/2898
   https://github.com/owncloud/web/pull/2915
   https://github.com/owncloud/web/pull/2918

Changelog for ownCloud Web [0.2.7] (2020-01-14)
=======================================
The following sections list the changes in ownCloud web 0.2.7 relevant to
ownCloud admins and users.

[0.2.7]: https://github.com/owncloud/web/compare/v0.2.6...v0.2.7

Summary
-------

* Bugfix - Display files list only if there is at least one item: [#2745](https://github.com/owncloud/web/issues/2745)
* Bugfix - Register store which is imported instead of required: [#2837](https://github.com/owncloud/web/issues/2837)
* Enhancement - Internal links in app switcher: [#2838](https://github.com/owncloud/web/issues/2838)

Details
-------

* Bugfix - Display files list only if there is at least one item: [#2745](https://github.com/owncloud/web/issues/2745)

   Vue virtual scroll was throwing an error in console in case that the files list was empty. We
   prevent this error by displaying the files list only if there is at least one item.

   https://github.com/owncloud/web/issues/2745

* Bugfix - Register store which is imported instead of required: [#2837](https://github.com/owncloud/web/issues/2837)

   As some extensions export store not as a module we need to handle that case as well.

   https://github.com/owncloud/web/issues/2837

* Enhancement - Internal links in app switcher: [#2838](https://github.com/owncloud/web/issues/2838)

   In case extensions integrates itself into Phonix core and not as own SPA we need to handle the
   navigation via router-link inside of Web core SPA.

   https://github.com/owncloud/web/issues/2838

## [0.2.6]
### Added
- Skip to component, id attribute for <main> https://github.com/owncloud/web/pull/2326
- Focus management regarding off canvas main nav https://github.com/owncloud/web/pull/2101
- Publish docker on tag https://github.com/owncloud/web/pull/2485
- New collaborators flow https://github.com/owncloud/web/pull/2450
- Hide quota on external storage https://github.com/owncloud/web/pull/2652
- Focus management for uploads https://github.com/owncloud/web/pull/2542
- File actions can be defined using config settings https://github.com/owncloud/web/pull/2651
- Files table virtual scroller https://github.com/owncloud/web/pull/2280
- Virtual scroll in trash bin https://github.com/owncloud/web/pull/2809

### Fixed
- Wrong method for copy action of public link https://github.com/owncloud/web/pull/2363
- Token refresh flow https://github.com/owncloud/web/pull/2472
- App tar balls need to contain top level folder named like the app itself https://github.com/owncloud/web/pull/2449
- Scroll behavior on mozilla firefox https://github.com/owncloud/web/pull/2475
- Steps order on release/publish https://github.com/owncloud/web/pull/2491
- Don't re-filter autocomplete collaborators results for remote user https://github.com/owncloud/web/pull/2569
- Limit concurrent uploads to one https://github.com/owncloud/web/pull/2653
- Extend share id check in public links https://github.com/owncloud/web/pull/2494
- Made the trashbin table responsive https://github.com/owncloud/web/pull/2287
- Hide checkbox label in files list https://github.com/owncloud/web/pull/2680
- Share flow accessibility https://github.com/owncloud/web/pull/2622
- Remove empty parentheses in shared with others list https://github.com/owncloud/web/pull/2725
- Do not hide collaborator if another entry with the same name exists if they are not the same type https://github.com/owncloud/web/pull/2724
- Display breadcrumb if rootFolder is set with no value https://github.com/owncloud/web/pull/2811
- Include avatar placeholder in relevant places https://github.com/owncloud/web/pull/2783

### Changed
- Decouple base file list into a separate component https://github.com/owncloud/web/pull/2318
- Switched the storage of the auth service from local to session storage https://github.com/owncloud/web/pull/2416
- Don't build the docker image in the release make file https://github.com/owncloud/web/pull/2495
- Use owncloud-sdk for uploading files https://github.com/owncloud/web/pull/2239
- Refactor collaborators to use helper classes and to map permissions https://github.com/owncloud/web/pull/2373
- Moved private link icon to "links" section https://github.com/owncloud/web/pull/2496
- Separate app switcher from app navigation sidebar https://github.com/owncloud/web/pull/2669

## [0.2.5]
### Added
- IE11 support https://github.com/owncloud/web/pull/2082
- Draw.io app integration https://github.com/owncloud/web/pull/2083
- New file menu entries for different file types https://github.com/owncloud/web/pull/2111
- Drone starlark https://github.com/owncloud/web/pull/2112
- Rename and delete will be disallowed in case the parent folder has no permissions fot these two operations https://github.com/owncloud/web/pull/2129
- Progress bar for upload https://github.com/owncloud/web/pull/2176
- Handle errors while deleting and renaming files https://github.com/owncloud/web/pull/2177
- Logout option on access denied page https://github.com/owncloud/web/pull/2178
- Download feedback spinner https://github.com/owncloud/web/pull/2179
- Remove rootFolder from breadcrumbs https://github.com/owncloud/web/pull/2196
- Send header X-Requested-With: XMLHttpRequest in all requests https://github.com/owncloud/web/pull/2197
- X-Frame-Options and Content-Security-Policy https://github.com/owncloud/web/pull/2311

### Fixed
- IE11 support for media viewer app https://github.com/owncloud/web/pull/2086
- Files drop when link password is set https://github.com/owncloud/web/pull/2096
- Detection of public pages despite existing auth https://github.com/owncloud/web/pull/2097
- Public link access in incognito mode https://github.com/owncloud/web/pull/2110
- Password handling in public links https://github.com/owncloud/web/pull/2117
- More close options to file actions menu https://github.com/owncloud/web/pull/2161
- Reset search value on clear action https://github.com/owncloud/web/pull/2198
- Prevent duplicate token refresh calls https://github.com/owncloud/web/pull/2205
- Use PQueue to run only one create folder promise in folder upload https://github.com/owncloud/web/pull/2210
- Upon token refresh do not perform full login on sdk level https://github.com/owncloud/web/pull/2211
- Exit link on access denied page https://github.com/owncloud/web/pull/2220
- Structure of folders in folder upload https://github.com/owncloud/web/pull/2224
- Remove file from progress after download on IE11 https://github.com/owncloud/web/pull/2310
- Properly reset capabilities on logout https://github.com/owncloud/web/pull/2116

### Changed
- For mounted folders use the full url as private link https://github.com/owncloud/web/pull/2170
- Store route in vuex before login in case user is unauthorized https://github.com/owncloud/web/pull/2170
- Use currentFolder path in breadcrumbs https://github.com/owncloud/web/pull/2196
- Switch to show instead of if in upload progress bar https://github.com/owncloud/web/pull/2206
- Key of file action buttons to ariaLabel https://github.com/owncloud/web/pull/2219
- Trigger add to progress before the folders creation https://github.com/owncloud/web/pull/2221
- Handle remove from progress in its own mutation https://github.com/owncloud/web/pull/2225
- Use oidc-client 1.9.1 https://github.com/owncloud/web/pull/2261

### Security
- Added sanitization to markdown editor app https://github.com/owncloud/web/pull/2233

### Removed
- Drag and drop in ie11 because of compatibility issues https://github.com/owncloud/web/pull/2128

## [0.2.4]
### Added
- Private link for the current folder to the app bar https://github.com/owncloud/web/pull/2009

### Fixed
- Clear state in case of error in authorisation https://github.com/owncloud/web/pull/2079
- Hide comma before mdate if there is no size https://github.com/owncloud/web/pull/2073
- Don't perform OIDC logout in case of error in authorisation https://github.com/owncloud/web/pull/2072


### Changed
- Use sharetype keys that are human readable instead of number https://github.com/owncloud/web/pull/2071

## [0.2.3]
### Added
- Set X-Requested-With header - required ownCloud 10.3 https://github.com/owncloud/web/pull/1984
- Use 2 spaces instead of tab for feature files https://github.com/owncloud/web/pull/2004
- Handle OAuth/OpenIdConnect error in callback request query string https://github.com/owncloud/web/pull/2011
- Enable loading apps from external sites https://github.com/owncloud/web/pull/1986
- Add default client side sort https://github.com/owncloud/web/pull/1972

### Fixed
- Public link permissions mix up https://github.com/owncloud/web/pull/1985
- Downgrade vuex-persist to 2.0.1 to fix IE11 issues https://github.com/owncloud/web/pull/2007

## [0.2.2]
### Added
- Show error message when user tries to upload a folder in IE11 https://github.com/owncloud/web/pull/1956
- Error message if the folder or file name is empty in create dialog and added default value https://github.com/owncloud/web/pull/1938
- Bookmarks to menu https://github.com/owncloud/web/pull/1949

### Fixed
- Redirect to access denied page if the user doesn't have access to Web instance https://github.com/owncloud/web/pull/1939
- Redirect to private link after user has logged in https://github.com/owncloud/web/pull/1900
- Breaking of link to help desk on new line https://github.com/owncloud/web/pull/1940

## [0.2.1]
### Added
- Download feedback https://github.com/owncloud/web/pull/1895

### Fixed
- Download of files shared with password-protected public links https://github.com/owncloud/web/issues/1808
- Search button on mobile devices https://github.com/owncloud/web/pull/1893
- Collapsing of alert messages after they have been closed https://github.com/owncloud/web/pull/1881

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

[Unreleased]: https://github.com/owncloud/web/compare/0.1.0...master
[0.1.0]: https://github.com/owncloud/web/compare/d1cfc2d5f82202ac30c91e903e4810f42650c183...0.1.0
