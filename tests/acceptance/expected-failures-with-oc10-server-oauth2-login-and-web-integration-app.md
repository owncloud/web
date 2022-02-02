## Scenarios from web tests that are expected to fail on oC10

Lines that contain a format like "[someSuite.someFeature.feature:n](https://github.com/owncloud/web/path/to/feature)"
are lines that document a specific expected failure. Follow that with a URL to the line in the feature file in GitHub.
Please follow this format for the actual expected failures.

Level-3 headings should be used for the references to the relevant issues. Include the issue title with a link to the issue in GitHub.

Other free text and markdown formatting can be used elsewhere in the document if needed. But if you want to explain something about the issue, then please post that in the issue itself.

### [regression in accepting shares from notifications](https://github.com/owncloud/web/issues/4839)
-   [webUISharingNotificationsToRoot/shareWithUsers.feature:40](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotificationsToRoot/shareWithUsers.feature#L40)

### [File link in notifications seems to not work](https://github.com/owncloud/web/issues/5227)
-   [webUISharingNotifications/notificationLink.feature:18](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotifications/notificationLink.feature#L18)
-   [webUISharingNotificationsToRoot/notificationLink.feature:17](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotificationsToRoot/notificationLink.feature#L17)

### [impossible to navigate into a folder in the trashbin](https://github.com/owncloud/web/issues/1725)
-   [webUITrashbinDelete/trashbinDelete.feature:29](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUITrashbinDelete/trashbinDelete.feature#L29)

### [Federated Shares not showing in shared with me page](https://github.com/owncloud/web/issues/2510)
- [webUISharingExternalToRoot/federationSharing.feature:169](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingExternalToRoot/federationSharing.feature#L169)

### [browsing directly to a details 'tab' is not possible](https://github.com/owncloud/web/issues/5464)
-   [webUIFiles/browseDirectlyToDetailsTab.feature:21](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFiles/browseDirectlyToDetailsTab.feature#L21)
-   [webUIFiles/browseDirectlyToDetailsTab.feature:22](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFiles/browseDirectlyToDetailsTab.feature#L22)
