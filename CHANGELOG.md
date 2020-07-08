Changelog for ownCloud Phoenix [unreleased] (UNRELEASED)
=======================================
The following sections list the changes in ownCloud phoenix unreleased relevant to
ownCloud admins and users.

[unreleased]: https://github.com/owncloud/phoenix/compare/v0.11.2...master

Summary
-------

* Change - Don't fallback to appId in case the route of file action is not defined: [#69](https://github.com/owncloud/product/issues/69)
* Change - Do not display outline when the files list is focused: [#3747](https://github.com/owncloud/phoenix/issues/3747)
* Change - No file drop if upload is not allowed or no space is left: [#3677](https://github.com/owncloud/phoenix/pull/3677)

Details
-------

* Change - Don't fallback to appId in case the route of file action is not defined: [#69](https://github.com/owncloud/product/issues/69)

   When opening a file in a editor or a viewer the path was falling back to an appId. This made it
   impossible to navigate via the file actions into an app which doesn't have duplicate appId in
   the route. We've stopped falling back to this value and in case that the route of the file action
   is not defined, we use the root path of the app.

   https://github.com/owncloud/product/issues/69
   https://github.com/owncloud/ocis/issues/356
   https://github.com/owncloud/phoenix/pull/3740

* Change - Do not display outline when the files list is focused: [#3747](https://github.com/owncloud/phoenix/issues/3747)

   The files list was displaying outline when it received focus after a click. Since the focus is
   meant only programatically, the outline was not supposed to be displayed.

   https://github.com/owncloud/phoenix/issues/3747
   https://github.com/owncloud/phoenix/issues/3551
   https://github.com/owncloud/phoenix/pull/3752

* Change - No file drop if upload is not allowed or no space is left: [#3677](https://github.com/owncloud/phoenix/pull/3677)

   https://github.com/owncloud/phoenix/pull/3677

Changelog for ownCloud Phoenix [0.11.2] (2020-07-03)
=======================================
The following sections list the changes in ownCloud phoenix 0.11.2 relevant to
ownCloud admins and users.

[0.11.2]: https://github.com/owncloud/phoenix/compare/v0.11.1...v0.11.2

Summary
-------

* Bugfix - Remove anchor on last breadcrumb segment: [#3722](https://github.com/owncloud/phoenix/issues/3722)

Details
-------

* Bugfix - Remove anchor on last breadcrumb segment: [#3722](https://github.com/owncloud/phoenix/issues/3722)

   The last segment of the breadcrumb was clickable, while it's expected that nothing happens (as
   it is the current path). We fixed that, the last breadcrumb element is not clickable anymore.

   https://github.com/owncloud/phoenix/issues/3722
   https://github.com/owncloud/phoenix/issues/2965
   https://github.com/owncloud/phoenix/issues/1883
   https://github.com/owncloud/phoenix/pull/3723

Changelog for ownCloud Phoenix [0.11.1] (2020-06-29)
=======================================
The following sections list the changes in ownCloud phoenix 0.11.1 relevant to
ownCloud admins and users.

[0.11.1]: https://github.com/owncloud/phoenix/compare/v0.11.0...v0.11.1

Summary
-------

* Bugfix - Public upload now keeps modified time: [#3686](https://github.com/owncloud/phoenix/pull/3686)
* Bugfix - Do not expand the width of resource name over it's content: [#3685](https://github.com/owncloud/phoenix/issues/3685)
* Change - Use "Shared with" as a label for indicators: [#3688](https://github.com/owncloud/phoenix/pull/3688)
* Enhancement - Update owncloud-sdk to 1.0.0-663: [#3690](https://github.com/owncloud/phoenix/pull/3690)

Details
-------

* Bugfix - Public upload now keeps modified time: [#3686](https://github.com/owncloud/phoenix/pull/3686)

   The public upload for public links now keeps the modification time of local files. This aligns
   the behavior with non-public file upload.

   https://github.com/owncloud/phoenix/pull/3686

* Bugfix - Do not expand the width of resource name over it's content: [#3685](https://github.com/owncloud/phoenix/issues/3685)

   The width of the resource name in the files list was expanded more than the actual width of it's
   content. This caused that when clicked outside of the resource name, the action to navigate or
   open the resource has been triggered instead of opening the sidebar. We've fixed the width that
   it is now equal to the width of the content.

   https://github.com/owncloud/phoenix/issues/3685
   https://github.com/owncloud/phoenix/pull/3687

* Change - Use "Shared with" as a label for indicators: [#3688](https://github.com/owncloud/phoenix/pull/3688)

   Instead of "State" we've started using the "Shared with" as a label for the indicators in the
   files list. This is only intermediate solution because the indicators can be extended by other
   indicators which don't have to be related to sharing.

   https://github.com/owncloud/phoenix/pull/3688

* Enhancement - Update owncloud-sdk to 1.0.0-663: [#3690](https://github.com/owncloud/phoenix/pull/3690)

   We've updated the owncloud-sdk to version 1.0.0-663. This version stops rejecting sharing
   promises if the passed shareID is not an integer.

   https://github.com/owncloud/phoenix/pull/3690

Changelog for ownCloud Phoenix [0.11.0] (2020-06-26)
=======================================
The following sections list the changes in ownCloud phoenix 0.11.0 relevant to
ownCloud admins and users.

[0.11.0]: https://github.com/owncloud/phoenix/compare/v0.10.0...v0.11.0

Summary
-------

* Bugfix - Fix file type icons for uppercase file extensions: [#3670](https://github.com/owncloud/phoenix/pull/3670)
* Bugfix - Fix empty settings values: [#3602](https://github.com/owncloud/phoenix/pull/3602)
* Bugfix - Set default permissions to public link quick action: [#3675](https://github.com/owncloud/phoenix/issues/3675)
* Bugfix - Set empty object when resetting current sidebar tab: [#3676](https://github.com/owncloud/phoenix/issues/3676)
* Bugfix - Set expiration date only if it is supported: [#3674](https://github.com/owncloud/phoenix/issues/3674)
* Bugfix - Add missing question mark to delete confirmation dialog in trashbin: [#3566](https://github.com/owncloud/phoenix/pull/3566)
* Change - Bring new modal component: [#2263](https://github.com/owncloud/phoenix/issues/2263)
* Change - Move create new button: [#3622](https://github.com/owncloud/phoenix/pull/3622)
* Change - Move status indicators under the resource name: [#3617](https://github.com/owncloud/phoenix/pull/3617)
* Change - Remove sidebar quickAccess: [#80](https://github.com/owncloud/product/issues/80)
* Change - Rework account dropdown: [#82](https://github.com/owncloud/product/issues/82)
* Change - Unite files list status indicators: [#3567](https://github.com/owncloud/phoenix/pull/3567)
* Change - Use correct logo: [#786](https://github.com/owncloud/owncloud-design-system/issues/786)
* Enhancement - Send mtime with uploads: [#2969](https://github.com/owncloud/phoenix/issues/2969)
* Enhancement - Use TUS settings from capabilities: [#177](https://github.com/owncloud/ocis-reva/issues/177)
* Enhancement - Add collaborators quick action: [#3573](https://github.com/owncloud/phoenix/pull/3573)
* Enhancement - Dynamically loaded nav items: [#3497](https://github.com/owncloud/phoenix/issues/3497)
* Enhancement - Load and display quick actions: [#3573](https://github.com/owncloud/phoenix/pull/3573)

Details
-------

* Bugfix - Fix file type icons for uppercase file extensions: [#3670](https://github.com/owncloud/phoenix/pull/3670)

   https://github.com/owncloud/phoenix/pull/3670

* Bugfix - Fix empty settings values: [#3602](https://github.com/owncloud/phoenix/pull/3602)

   We've updated owncloud-sdk to version 1.0.0-638 which makes sure that an empty array gets
   returned whenever there are no settings values for the authenticated user. Previously having
   no settings values broke our detection of whether settings values finished loading.

   https://github.com/owncloud/ocis-settings/issues/24
   https://github.com/owncloud/phoenix/pull/3602

* Bugfix - Set default permissions to public link quick action: [#3675](https://github.com/owncloud/phoenix/issues/3675)

   We've set a default permissions when creating a new public link via the quick actions. The
   permissions are set to `1`.

   https://github.com/owncloud/phoenix/issues/3675
   https://github.com/owncloud/phoenix/pull/3678

* Bugfix - Set empty object when resetting current sidebar tab: [#3676](https://github.com/owncloud/phoenix/issues/3676)

   We've changed the argument from `null` to an empty object when resetting the current tab of the
   sidebar.

   https://github.com/owncloud/phoenix/issues/3676
   https://github.com/owncloud/phoenix/pull/3678

* Bugfix - Set expiration date only if it is supported: [#3674](https://github.com/owncloud/phoenix/issues/3674)

   We've stopped setting expiration date in collaborators panel if it is not supported.

   https://github.com/owncloud/phoenix/issues/3674
   https://github.com/owncloud/phoenix/pull/3679

* Bugfix - Add missing question mark to delete confirmation dialog in trashbin: [#3566](https://github.com/owncloud/phoenix/pull/3566)

   We've added missing question mark to the delete confirmation dialog inside of the trashbin.

   https://github.com/owncloud/phoenix/pull/3566

* Change - Bring new modal component: [#2263](https://github.com/owncloud/phoenix/issues/2263)

   We've updated our modal component with a new one coming from ODS.

   https://github.com/owncloud/phoenix/issues/2263
   https://github.com/owncloud/phoenix/pull/3378

* Change - Move create new button: [#3622](https://github.com/owncloud/phoenix/pull/3622)

   We've moved the create new button in the files app bar to the left directly next to breadcrumbs.

   https://github.com/owncloud/phoenix/pull/3622

* Change - Move status indicators under the resource name: [#3617](https://github.com/owncloud/phoenix/pull/3617)

   We've moved the sharing status indicators from an own column in the files list to a second row
   under the resource name.

   https://github.com/owncloud/phoenix/pull/3617

* Change - Remove sidebar quickAccess: [#80](https://github.com/owncloud/product/issues/80)

   We have removed the sidebar quickAccess extension point. To create an quick access to the
   sidebar, we need to use the quickActions extension point.

   https://github.com/owncloud/product/issues/80
   https://github.com/owncloud/phoenix/pull/3586

* Change - Rework account dropdown: [#82](https://github.com/owncloud/product/issues/82)

   We've removed user avatar, user email and version from the account dropdown. The log out button
   has been changed into a link. All links in account dropdown are now inside of a list.

   https://github.com/owncloud/product/issues/82
   https://github.com/owncloud/phoenix/pull/3605

* Change - Unite files list status indicators: [#3567](https://github.com/owncloud/phoenix/pull/3567)

   We've merged direct and indirect status indicators in the files list. With this change, we
   focus on the important information of the indicator (e.g. resource is shared). Any additional
   information can then be displayed in the related tab of the sidebar.

   https://github.com/owncloud/phoenix/pull/3567

* Change - Use correct logo: [#786](https://github.com/owncloud/owncloud-design-system/issues/786)

   We've changed the ownCloud logo which is used in the default theme. The previous logo had an
   incorrect font-weight.

   https://github.com/owncloud/owncloud-design-system/issues/786
   https://github.com/owncloud/phoenix/pull/3604

* Enhancement - Send mtime with uploads: [#2969](https://github.com/owncloud/phoenix/issues/2969)

   When uploading a file, the modification time is now sent along. This means that the uploaded
   file will have the same modification time like the one it had on disk. This aligns the behavior
   with the desktop client which also keeps the mtime.

   https://github.com/owncloud/phoenix/issues/2969
   https://github.com/owncloud/phoenix/pull/3377

* Enhancement - Use TUS settings from capabilities: [#177](https://github.com/owncloud/ocis-reva/issues/177)

   The TUS settings advertise the maximum chunk size, so we now use the smallest chunk size from the
   one configured in config.json and the one from the capabilities.

   If the capabilities report that one should use the X-HTTP-Override-Method header, the upload
   will now use a POST request for uploads with that header set instead of PATCH.

   https://github.com/owncloud/ocis-reva/issues/177
   https://github.com/owncloud/phoenix/pull/3568

* Enhancement - Add collaborators quick action: [#3573](https://github.com/owncloud/phoenix/pull/3573)

   We've added a new quick action which opens the new collaborators tab in the files list sidebar.

   https://github.com/owncloud/phoenix/pull/3573

* Enhancement - Dynamically loaded nav items: [#3497](https://github.com/owncloud/phoenix/issues/3497)

   We have moved the navItems from application configuration into a store module. We extended
   it's functionality by introducing statically and dynamically loaded navItems. This way
   navItems can be loaded based on extension data, as soon as the extension becomes active. Please
   note that having at least one static navItem (coming from the appInfo object of an extension) is
   still a requirement for the extension appearing in the app switcher.

   https://github.com/owncloud/phoenix/issues/3497
   https://github.com/owncloud/phoenix/pull/3570

* Enhancement - Load and display quick actions: [#3573](https://github.com/owncloud/phoenix/pull/3573)

   We've added an extension point into files apps for quick actions. By creating and exporting an
   object called quickActions, developers can define an action which will be then displayed in
   the files list.

   https://github.com/owncloud/phoenix/pull/3573

Changelog for ownCloud Phoenix [0.10.0] (2020-05-26)
=======================================
The following sections list the changes in ownCloud phoenix 0.10.0 relevant to
ownCloud admins and users.

[0.10.0]: https://github.com/owncloud/phoenix/compare/v0.9.0...v0.10.0

Summary
-------

* Bugfix - Fix share indicators click to open the correct panel: [#3324](https://github.com/owncloud/phoenix/issues/3324)
* Bugfix - Set server config to ocis proxy in example config file: [#3454](https://github.com/owncloud/phoenix/pull/3454)
* Change - Removed favorite button from file list and added it in the sidebar: [#1987](https://github.com/owncloud/phoenix/issues/1987)
* Change - Make settings available in phoenix: [#3484](https://github.com/owncloud/phoenix/pull/3484)
* Change - Use language setting: [#3484](https://github.com/owncloud/phoenix/pull/3484)
* Change - Permanently visible branded left navigation sidebar: [#3395](https://github.com/owncloud/phoenix/issues/3395)

Details
-------

* Bugfix - Fix share indicators click to open the correct panel: [#3324](https://github.com/owncloud/phoenix/issues/3324)

   When clicking on a share indicator inside a file list row, the correct share panel will now be
   displayed.

   https://github.com/owncloud/phoenix/issues/3324
   https://github.com/owncloud/phoenix/pull/3420

* Bugfix - Set server config to ocis proxy in example config file: [#3454](https://github.com/owncloud/phoenix/pull/3454)

   We fixed the ocis example config to point to the default oCIS Proxy address instead of the
   default Phoenix service address.

   https://github.com/owncloud/phoenix/pull/3454

* Change - Removed favorite button from file list and added it in the sidebar: [#1987](https://github.com/owncloud/phoenix/issues/1987)

   We've removed the favorite star button in the file list and added instead a functionality to the
   before non-working star button in the file's sidebar. We also added a new action in the file
   action dropdown menu which allows you to toggle the favorite status of your file.

   https://github.com/owncloud/phoenix/issues/1987
   https://github.com/owncloud/phoenix/pull/3336

* Change - Make settings available in phoenix: [#3484](https://github.com/owncloud/phoenix/pull/3484)

   We upgraded to a new owncloud-sdk version which provides loading settings from the settings
   service, if available. The settings values are available throughout phoenix and all
   extensions.

   https://github.com/owncloud/phoenix/pull/3484

* Change - Use language setting: [#3484](https://github.com/owncloud/phoenix/pull/3484)

   We've changed phoenix to make use of the language the authenticated user has chosen in the
   settings.

   https://github.com/owncloud/phoenix/pull/3484

* Change - Permanently visible branded left navigation sidebar: [#3395](https://github.com/owncloud/phoenix/issues/3395)

   We've made left navigation sidebar permanently visible and moved branding (logo and brand
   color) into it.

   https://github.com/owncloud/phoenix/issues/3395
   https://github.com/owncloud/phoenix/pull/3442

Changelog for ownCloud Phoenix [0.9.0] (2020-04-27)
=======================================
The following sections list the changes in ownCloud phoenix 0.9.0 relevant to
ownCloud admins and users.

[0.9.0]: https://github.com/owncloud/phoenix/compare/v0.8.0...v0.9.0

Summary
-------

* Bugfix - Remove deleted files from search result: [#3266](https://github.com/owncloud/phoenix/pull/3266)
* Bugfix - Show token string if link name is empty in FileLinkSidebar: [#3297](https://github.com/owncloud/phoenix/pull/3297)
* Bugfix - Remove duplicate error display in input prompt: [#3342](https://github.com/owncloud/phoenix/pull/3342)
* Bugfix - Fix translation message extraction from plain javascript files: [#3346](https://github.com/owncloud/phoenix/pull/3346)
* Bugfix - Fix name of selected extension on broken apps: [#3376](https://github.com/owncloud/phoenix/pull/3376)
* Change - Update owncloud-sdk: [#3369](https://github.com/owncloud/phoenix/pull/3369)
* Enhancement - Add chunked upload with tus-js-client: [#67](https://github.com/owncloud/phoenix/issues/67)

Details
-------

* Bugfix - Remove deleted files from search result: [#3266](https://github.com/owncloud/phoenix/pull/3266)

   Deleted file has been removed from filesSearched state by adding a new mutation. Also, filter
   condition in remove file mutations has been changed from object reference to unique file id.

   https://github.com/owncloud/phoenix/issues/3043
   https://github.com/owncloud/phoenix/issues/3044
   https://github.com/owncloud/phoenix/pull/3266

* Bugfix - Show token string if link name is empty in FileLinkSidebar: [#3297](https://github.com/owncloud/phoenix/pull/3297)

   Owncloud-js-client was parsing empty link name xml attribute as empty object. The empty
   object was changed with an empty string. Also, FileLinkSidebar behaviour fixed by showing
   token as name for the link shares without a name.

   https://github.com/owncloud/phoenix/issues/2517
   https://github.com/owncloud/phoenix/pull/3297

* Bugfix - Remove duplicate error display in input prompt: [#3342](https://github.com/owncloud/phoenix/pull/3342)

   Validation errors within the input prompt dialog were showing up twice. One of them is a
   leftover from the old version. We've fixed the dialog by removing the old validation error
   type.

   https://github.com/owncloud/phoenix/pull/3342

* Bugfix - Fix translation message extraction from plain javascript files: [#3346](https://github.com/owncloud/phoenix/pull/3346)

   https://github.com/Polyconseil/easygettext/issues/81
   https://github.com/owncloud/phoenix/pull/3346

* Bugfix - Fix name of selected extension on broken apps: [#3376](https://github.com/owncloud/phoenix/pull/3376)

   With the edge case of a broken app in config.json, the top bar is broken, because appInfo can't be
   loaded. We made ocis-web more robust by just showing the extension id in the top bar when the
   appInfo is not available.

   https://github.com/owncloud/phoenix/pull/3376

* Change - Update owncloud-sdk: [#3369](https://github.com/owncloud/phoenix/pull/3369)

   Updated owncloud-sdk to v1.0.0-604

   https://github.com/owncloud/phoenix/pull/3369

* Enhancement - Add chunked upload with tus-js-client: [#67](https://github.com/owncloud/phoenix/issues/67)

   Whenever the backend server advertises TUS support, uploading files will use TUS as well for
   uploading, which makes it possible to resume failed uploads. It is also possible to optionally
   set a chunk size by setting a numeric value for "uploadChunkSize" in bytes in config.json.

   https://github.com/owncloud/phoenix/issues/67
   https://github.com/owncloud/phoenix/pull/3345

Changelog for ownCloud Phoenix [0.8.0] (2020-04-14)
=======================================
The following sections list the changes in ownCloud phoenix 0.8.0 relevant to
ownCloud admins and users.

[0.8.0]: https://github.com/owncloud/phoenix/compare/v0.7.0...v0.8.0

Summary
-------

* Bugfix - Display errors when saving collaborator fails: [#3176](https://github.com/owncloud/phoenix/issues/3176)
* Bugfix - Fix media-viewer on private pages: [#3288](https://github.com/owncloud/phoenix/pull/3288)
* Bugfix - Fix oidc redirect after logout: [#3285](https://github.com/owncloud/phoenix/issues/3285)
* Bugfix - Update owncloud-sdk 1.0.0-544: [#3292](https://github.com/owncloud/phoenix/pull/3292)
* Bugfix - Set a higher timeout for requirejs: [#3293](https://github.com/owncloud/phoenix/pull/3293)
* Enhancement - Visual improvement to errors in input prompts: [#1906](https://github.com/owncloud/phoenix/issues/1906)
* Enhancement - Add state to app urls: [#3294](https://github.com/owncloud/phoenix/pull/3294)

Details
-------

* Bugfix - Display errors when saving collaborator fails: [#3176](https://github.com/owncloud/phoenix/issues/3176)

   When saving a collaborator has failed, the UI was still behaving like it saved everything
   successfully. This has been fixed by displaying the errors at the top of the collaborator
   editing form and staying in the editing view.

   https://github.com/owncloud/phoenix/issues/3176
   https://github.com/owncloud/phoenix/pull/3241

* Bugfix - Fix media-viewer on private pages: [#3288](https://github.com/owncloud/phoenix/pull/3288)

   Media-viewer incorrectly assumed it was on a public page when opened from a private page.

   https://github.com/owncloud/phoenix/pull/3288

* Bugfix - Fix oidc redirect after logout: [#3285](https://github.com/owncloud/phoenix/issues/3285)

   After the logout the idp sent a redirect to `<redirectUri>?state=` which was then redirected
   to `<redirectUri>?state=#/login` by phoenix. Having the query parameters in between broke
   the application. To prevent the whole login url `<baseUrl>#/login` should be sent then the
   query parameter will be appended to the end.

   https://github.com/owncloud/phoenix/issues/3285

* Bugfix - Update owncloud-sdk 1.0.0-544: [#3292](https://github.com/owncloud/phoenix/pull/3292)

   This sdk version is much smaller in size

   https://github.com/owncloud/phoenix/pull/3292

* Bugfix - Set a higher timeout for requirejs: [#3293](https://github.com/owncloud/phoenix/pull/3293)

   In slow networks requirejs requests can timeout. The timeout is now set to a higher value (200
   secs)

   https://github.com/owncloud/phoenix/pull/3293

* Enhancement - Visual improvement to errors in input prompts: [#1906](https://github.com/owncloud/phoenix/issues/1906)

   We've adjusted the input prompts to show a visually less prominent text below the input field.
   Also, error messages now appear with a small delay, so that those happening during typing get
   ignored (e.g. trailing whitespace is not allowed in folder names and previously caused an
   error to show on every typed blank).

   https://github.com/owncloud/phoenix/issues/1906
   https://github.com/owncloud/phoenix/pull/3240

* Enhancement - Add state to app urls: [#3294](https://github.com/owncloud/phoenix/pull/3294)

   Currently opened file can be added to app routes so reloading the page can be made to work For now
   it's only implemented in mediaviewer

   https://github.com/owncloud/phoenix/pull/3294

Changelog for ownCloud Phoenix [0.7.0] (2020-03-30)
=======================================
The following sections list the changes in ownCloud phoenix 0.7.0 relevant to
ownCloud admins and users.

[0.7.0]: https://github.com/owncloud/phoenix/compare/v0.6.0...v0.7.0

Summary
-------

* Bugfix - Fix logout when no tokens are known anymore: [#2961](https://github.com/owncloud/phoenix/pull/2961)
* Bugfix - Files list status indicators are now appearing without any delay: [#2973](https://github.com/owncloud/phoenix/issues/2973)
* Bugfix - Fix file actions menu when using OCIS backend: [#3214](https://github.com/owncloud/phoenix/issues/3214)
* Bugfix - Do not remove first character of etag: [#3274](https://github.com/owncloud/phoenix/pull/3274)
* Change - Don't import whole core-js bundle directly into core: [#3173](https://github.com/owncloud/phoenix/pull/3173)
* Enhancement - Added thumbnails in file list: [#276](https://github.com/owncloud/phoenix/issues/276)

Details
-------

* Bugfix - Fix logout when no tokens are known anymore: [#2961](https://github.com/owncloud/phoenix/pull/2961)

   Single Log Out requires the id_token and in cases where this token is no longer known calling the
   SLO endpoint will result in an error.

   This has been fixed.

   https://github.com/owncloud/phoenix/pull/2961

* Bugfix - Files list status indicators are now appearing without any delay: [#2973](https://github.com/owncloud/phoenix/issues/2973)

   We've stopped loading file list status indicators asynchronously to prevent them from
   appearing delayed. They appear now at the same time as the file list.

   https://github.com/owncloud/phoenix/issues/2973
   https://github.com/owncloud/phoenix/pull/3213

* Bugfix - Fix file actions menu when using OCIS backend: [#3214](https://github.com/owncloud/phoenix/issues/3214)

   When using OCIS as backend, the ids of resources is a string instead of integer. So we cannot
   embed those into DOM node ids and need to use another alternative. This fix introduces a unique
   viewId which is only there to provide uniqueness across the current list and should not be used
   for any data related operation.

   This fixes the file actions menu when using OCIS as backend.

   https://github.com/owncloud/phoenix/issues/3214
   https://github.com/owncloud/ocis-phoenix/issues/51

* Bugfix - Do not remove first character of etag: [#3274](https://github.com/owncloud/phoenix/pull/3274)

   When stripping away double quotes in etag of the file thumbnails, we accidentally removed
   first character as well. We've stopped removing that character.

   https://github.com/owncloud/phoenix/pull/3274

* Change - Don't import whole core-js bundle directly into core: [#3173](https://github.com/owncloud/phoenix/pull/3173)

   We've stopped importing whole core-js bundle directly into core and instead load only used
   parts with babel.

   https://github.com/owncloud/phoenix/pull/3173

* Enhancement - Added thumbnails in file list: [#276](https://github.com/owncloud/phoenix/issues/276)

   Thumbnails are now displayed in the file list for known file types. When no thumbnail was
   returned, fall back to the file type icon.

   https://github.com/owncloud/phoenix/issues/276
   https://github.com/owncloud/phoenix/pull/3187

Changelog for ownCloud Phoenix [0.6.0] (2020-03-16)
=======================================
The following sections list the changes in ownCloud phoenix 0.6.0 relevant to
ownCloud admins and users.

[0.6.0]: https://github.com/owncloud/phoenix/compare/v0.5.0...v0.6.0

Summary
-------

* Bugfix - Indirect share info now visible in favorite and other file lists: [#3040](https://github.com/owncloud/phoenix/issues/3040)
* Bugfix - Fixed layout of file lists: [#3100](https://github.com/owncloud/phoenix/pull/3100)
* Bugfix - Changed share icons to collaborators icons: [#3116](https://github.com/owncloud/phoenix/pull/3116)
* Bugfix - Sorted collaborators column, deduplicate public entry: [#3137](https://github.com/owncloud/phoenix/issues/3137)
* Bugfix - Use end of the day in expiration date: [#3158](https://github.com/owncloud/phoenix/pull/3158)
* Change - Moved collaborators additional info on own row and removed type row: [#3130](https://github.com/owncloud/phoenix/pull/3130)
* Change - New sort order for collaborators and public links: [#3136](https://github.com/owncloud/phoenix/pull/3136)
* Change - Stop support for deployment of Phoenix as an ownCloud app: [#3162](https://github.com/owncloud/phoenix/pull/3162)
* Change - Align columns in file lists to the right: [#3036](https://github.com/owncloud/phoenix/issues/3036)
* Enhancement - Expiration date for collaborators: [#2543](https://github.com/owncloud/phoenix/issues/2543)

Details
-------

* Bugfix - Indirect share info now visible in favorite and other file lists: [#3040](https://github.com/owncloud/phoenix/issues/3040)

   When open the share panel of other flat file lists like the favorites, the collaborators list
   and link list are now showing the same entries like in the "All files" list, which includes
   indirect shares (via) that were previously missing.

   https://github.com/owncloud/phoenix/issues/3040
   https://github.com/owncloud/phoenix/pull/3135

* Bugfix - Fixed layout of file lists: [#3100](https://github.com/owncloud/phoenix/pull/3100)

   A recent library update in ODS for the recycle scroller seem to have changed the logic or
   calculation of the height.

   This fix accomodates for that change and restores the row height to a correct value.

   The shared file lists are now more responsive, the collaborators/owner and share time columns
   are now hidden on small screens.

   https://github.com/owncloud/phoenix/pull/3100

* Bugfix - Changed share icons to collaborators icons: [#3116](https://github.com/owncloud/phoenix/pull/3116)

   Adjust icon in files app navigation bar and also in the file actions dropdown to use the group
   icon.

   https://github.com/owncloud/phoenix/pull/3116

* Bugfix - Sorted collaborators column, deduplicate public entry: [#3137](https://github.com/owncloud/phoenix/issues/3137)

   The collaborators column that appears in the "shared with others" section are now sorted:
   first by share type (user, group, link, remote) and then by display name using natural sort.
   Additionally, if there is more than one public link for the resource, the text "Public" only
   appears once in the collaborators column.

   https://github.com/owncloud/phoenix/issues/3137
   https://github.com/owncloud/phoenix/pull/3171

* Bugfix - Use end of the day in expiration date: [#3158](https://github.com/owncloud/phoenix/pull/3158)

   We've changed the expiration date field in the collaborators list to the end of the day.

   https://github.com/owncloud/phoenix/pull/3158

* Change - Moved collaborators additional info on own row and removed type row: [#3130](https://github.com/owncloud/phoenix/pull/3130)

   We've moved collaborators additional info on own row under the name of collaborator and
   removed collaborator type row.

   https://github.com/owncloud/phoenix/pull/3130

* Change - New sort order for collaborators and public links: [#3136](https://github.com/owncloud/phoenix/pull/3136)

   We've changed the sort order for collaborators and public links. Collaborators are now sorted
   by: collaborator type, is collaborator direct, display name and creation date. Public links
   are now sorted by: is public link direct, display name and creation date.

   https://github.com/owncloud/phoenix/pull/3136

* Change - Stop support for deployment of Phoenix as an ownCloud app: [#3162](https://github.com/owncloud/phoenix/pull/3162)

   We've stopped supporting deployment of Phoenix as an ownCloud app. In the release is no longer
   available Phoenix ownCloud 10 app package.

   https://github.com/owncloud/phoenix/pull/3162

* Change - Align columns in file lists to the right: [#3036](https://github.com/owncloud/phoenix/issues/3036)

   We've aligned columns in all file lists to the right so it is easier for the user to compare them.

   https://github.com/owncloud/phoenix/issues/3036
   https://github.com/owncloud/phoenix/pull/3163

* Enhancement - Expiration date for collaborators: [#2543](https://github.com/owncloud/phoenix/issues/2543)

   We've added an expiration date for collaborators. Users can choose an expiration date for
   users and groups. After the date is reached the collaborator is automatically removed. Admins
   can set default expiration date or enforce it.

   https://github.com/owncloud/phoenix/issues/2543
   https://github.com/owncloud/phoenix/pull/3086

Changelog for ownCloud Phoenix [0.5.0] (2020-03-02)
=======================================
The following sections list the changes in ownCloud phoenix 0.5.0 relevant to
ownCloud admins and users.

[0.5.0]: https://github.com/owncloud/phoenix/compare/v0.4.0...v0.5.0

Summary
-------

* Bugfix - Various fixes for files app in responsive mode: [#2998](https://github.com/owncloud/phoenix/issues/2998)
* Bugfix - Responsive buttons layout in app bar when multiple files are selected: [#3011](https://github.com/owncloud/phoenix/issues/3011)
* Bugfix - Fix accessible labels that said $gettext: [#3039](https://github.com/owncloud/phoenix/pull/3039)
* Bugfix - Fix console warning about search query in public page: [#3041](https://github.com/owncloud/phoenix/pull/3041)
* Bugfix - Moved resharers to the top of owner collaborator entry: [#3850](https://github.com/owncloud/phoenix/issues/3850)
* Change - Moved sidebar navigation under top bar: [#3077](https://github.com/owncloud/phoenix/pull/3077)
* Enhancement - Added ability to click file list columns for sorting: [#1854](https://github.com/owncloud/phoenix/issues/1854)
* Enhancement - Improved collaborators column in shared file lists: [#2924](https://github.com/owncloud/phoenix/issues/2924)
* Enhancement - Display decimals in resource size column only for MBs or higher: [#2986](https://github.com/owncloud/phoenix/issues/2986)
* Enhancement - Different message in overwrite dialog when versioning is enabled: [#3047](https://github.com/owncloud/phoenix/issues/3047)
* Enhancement - Current user entry in collaborators list in sidebar: [#3808](https://github.com/owncloud/phoenix/issues/3808)

Details
-------

* Bugfix - Various fixes for files app in responsive mode: [#2998](https://github.com/owncloud/phoenix/issues/2998)

   Fixed properly alignment of header columns with the body of the files table which stays even
   after resizing. Removed the column label for the actions column as it looks nicer.

   https://github.com/owncloud/phoenix/issues/2998
   https://github.com/owncloud/phoenix/pull/2999

* Bugfix - Responsive buttons layout in app bar when multiple files are selected: [#3011](https://github.com/owncloud/phoenix/issues/3011)

   We've fixed the responsive buttons layout in files app bar when multiple files are selected
   where bulk actions where overlapping and height of the buttons was increased.

   https://github.com/owncloud/phoenix/issues/3011
   https://github.com/owncloud/phoenix/pull/3083

* Bugfix - Fix accessible labels that said $gettext: [#3039](https://github.com/owncloud/phoenix/pull/3039)

   Fixed three accessible aria labels that were saying "$gettext" instead of their actual
   translated text.

   https://github.com/owncloud/phoenix/pull/3039

* Bugfix - Fix console warning about search query in public page: [#3041](https://github.com/owncloud/phoenix/pull/3041)

   Fixed console warning about the search query attribute not being available whenever the
   search fields are not visible, for example when accessing a public link page.

   https://github.com/owncloud/phoenix/pull/3041

* Bugfix - Moved resharers to the top of owner collaborator entry: [#3850](https://github.com/owncloud/phoenix/issues/3850)

   For received shares, the resharers user display names are now shown on top of the owner entry in
   the collaborators list, with a reshare icon, instead of having their own entry in the
   collaborators list.

   This makes the reshare situation more clear and removes the ambiguity about the formerly
   displayed "resharer" role which doesn't exist.

   https://github.com/owncloud/phoenix/issues/3850

* Change - Moved sidebar navigation under top bar: [#3077](https://github.com/owncloud/phoenix/pull/3077)

   We've adjusted the position of the sidebar navigation to be under the top bar.

   https://github.com/owncloud/phoenix/pull/3077

* Enhancement - Added ability to click file list columns for sorting: [#1854](https://github.com/owncloud/phoenix/issues/1854)

   The sorting mode of the file list can now be changed by clicking on the column headers.

   https://github.com/owncloud/phoenix/issues/1854

* Enhancement - Improved collaborators column in shared file lists: [#2924](https://github.com/owncloud/phoenix/issues/2924)

   Fixed issue with the collaborators column where only one was being displayed in the "shared
   with you" file list. This is done by properly aggregating all share entries under each file
   entry for the list, which now also includes group shares and link shares.

   Improved the look of the collaborators by adding avatars and icons there for the shares in the
   collaborators and owner columns.

   https://github.com/owncloud/phoenix/issues/2924
   https://github.com/owncloud/phoenix/pull/3049

* Enhancement - Display decimals in resource size column only for MBs or higher: [#2986](https://github.com/owncloud/phoenix/issues/2986)

   We've stopped displaying decimals in resource size column for sizes smaller than 1 MB. We've
   also started displaying only one decimal.

   https://github.com/owncloud/phoenix/issues/2986
   https://github.com/owncloud/phoenix/pull/3051

* Enhancement - Different message in overwrite dialog when versioning is enabled: [#3047](https://github.com/owncloud/phoenix/issues/3047)

   We've added a new message in the overwrite dialog when versioning is enabled. This message is
   intended to make it clear that the resource won't be overwritten but a new version of it will be
   created.

   https://github.com/owncloud/phoenix/issues/3047
   https://github.com/owncloud/phoenix/pull/3050

* Enhancement - Current user entry in collaborators list in sidebar: [#3808](https://github.com/owncloud/phoenix/issues/3808)

   We've added a new entry into the collaborators list in sidebar which contains current user.

   https://github.com/owncloud/phoenix/issues/3808
   https://github.com/owncloud/phoenix/pull/3060

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

   https://github.com/owncloud/phoenix/issues/2998
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
