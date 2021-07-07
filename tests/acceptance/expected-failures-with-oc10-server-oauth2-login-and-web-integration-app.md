## Scenarios from web tests that are expected to fail on oC10

Lines that contain a format like "[someSuite.someFeature.feature:n](https://github.com/owncloud/web/path/to/feature)"
are lines that document a specific expected failure. Follow that with a URL to the line in the feature file in GitHub.
Please follow this format for the actual expected failures.

Level-3 headings should be used for the references to the relevant issues. Include the issue title with a link to the issue in GitHub.

Other free text and markdown formatting can be used elsewhere in the document if needed. But if you want to explain something about the issue, then please post that in the issue itself.

### [regression in accepting shares from notifications](https://github.com/owncloud/web/issues/4839)
-   [webUISharingNotificationsToRoot/shareWithUsers.feature:40](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotificationsToRoot/shareWithUsers.feature#L40)

### [File link in notifications seems to not work] (https://github.com/owncloud/web/issues/5227)
-   [webUISharingNotifications/notificationLink.feature:18](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotifications/notificationLink.feature#L18)
-   [webUISharingNotificationsToRoot/notificationLink.feature:17](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotificationsToRoot/notificationLink.feature#L17)

### [Trashbin Delete with small screen size] (https://github.com/owncloud/web/issues/5372)
-   [webUITrashbinDelete/trashbinDelete.feature:29](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUITrashbinDelete/trashbinDelete.feature#29)
