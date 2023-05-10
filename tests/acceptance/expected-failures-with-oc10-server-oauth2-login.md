## Scenarios from web tests that are expected to fail on oC10

Lines that contain a format like "[someSuite.someFeature.feature:n](https://github.com/owncloud/web/path/to/feature)"
are lines that document a specific expected failure. Follow that with a URL to the line in the feature file in GitHub.
Please follow this format for the actual expected failures.

Level-3 headings should be used for the references to the relevant issues. Include the issue title with a link to the issue in GitHub.

Other free text and markdown formatting can be used elsewhere in the document if needed. But if you want to explain something about the issue, then please post that in the issue itself.

### [Comments in sidebar](https://github.com/owncloud/web/issues/1158)
-   [webUIFilesDetails/fileDetails.feature:84](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFilesDetails/fileDetails.feature#L84)
-   [webUIFilesDetails/fileDetails.feature:98](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFilesDetails/fileDetails.feature#L98)
-   [webUIFilesDetails/fileDetails.feature:113](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFilesDetails/fileDetails.feature#L113)
-   [webUIFilesDetails/fileDetails.feature:128](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFilesDetails/fileDetails.feature#L128)

### [Saving public share is not possible](https://github.com/owncloud/web/issues/5321)
-   [webUISharingPublicManagement/shareByPublicLink.feature:24](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingPublicManagement/shareByPublicLink.feature#L24)

### [Uploading folders does not work in files-drop](https://github.com/owncloud/web/issues/2443)
-   [webUISharingPublicDifferentRoles/shareByPublicLinkDifferentRoles.feature:268](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingPublicDifferentRoles/shareByPublicLinkDifferentRoles.feature#L268)

### [Writing to locked files/folders give only a generic error message](https://github.com/owncloud/web/issues/5741)
-   [webUIWebdavLockProtection/upload.feature:32](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIWebdavLockProtection/upload.feature#L32)
-   [webUIWebdavLockProtection/upload.feature:33](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIWebdavLockProtection/upload.feature#L33)

### [Federated shares not showing in shared with me page](https://github.com/owncloud/web/issues/2510)
-   [webUISharingExternalToRoot/federationSharing.feature:32](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingExternalToRoot/federationSharing.feature#L32)
-   [webUISharingExternalToRoot/federationSharing.feature:170](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingExternalToRoot/federationSharing.feature#L170)
-   [webUISharingExternal/federationSharing.feature:38](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingExternal/federationSharing.feature#L38)
-   [webUISharingExternal/federationSharing.feature:166](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingExternal/federationSharing.feature#L166)

### [reshared share that is shared with a group the sharer is part of shows twice on "Share with me" page](https://github.com/owncloud/web/issues/2512)
-   [webUISharingAcceptShares/acceptShares.feature:31](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingAcceptShares/acceptShares.feature#L31)

### [empty subfolder inside a folder to be uploaded is not created on the server](https://github.com/owncloud/web/issues/6348)
- [webUIUpload/upload.feature:43](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIUpload/upload.feature#L43)
