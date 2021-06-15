## Scenarios from web tests that are expected to fail on oC10

Lines that contain a format like "[someSuite.someFeature.feature:n](https://github.com/owncloud/web/path/to/feature)"
are lines that document a specific expected failure. Follow that with a URL to the line in the feature file in GitHub.
Please follow this format for the actual expected failures.

Level-3 headings should be used for the references to the relevant issues. Include the issue title with a link to the issue in GitHub.

Other free text and markdown formatting can be used elsewhere in the document if needed. But if you want to explain something about the issue, then please post that in the issue itself.

### [regression in accepting shares from notifications](https://github.com/owncloud/web/issues/4839)
-   [webUISharingNotificationsToRoot/shareWithUsers.feature:40](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotificationsToRoot/shareWithUsers.feature#L40)

### [Admin settings feature not implemented yet] (https://github.com/owncloud/web/issues/5015)
-   [webUIAdminSettings/adminAppsSettings.feature:11](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminAppsSettings.feature#L11)
-   [webUIAdminSettings/adminAppsSettings.feature:17](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminAppsSettings.feature#L17)
-   [webUIAdminSettings/adminGeneralSettings.feature:12](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminGeneralSettings.feature#L12)
-   [webUIAdminSettings/adminGeneralSettings.feature:30](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminGeneralSettings.feature#L30)
-   [webUIAdminSettings/adminGeneralSettings.feature:36](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminGeneralSettings.feature#L36)
-   [webUIAdminSettings/adminGeneralSettings.feature:42](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminGeneralSettings.feature#L42)
-   [webUIAdminSettings/adminGeneralSettings.feature:49](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminGeneralSettings.feature#L49)
-   [webUIAdminSettings/adminGeneralSettings.feature:56](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminGeneralSettings.feature#L56)
-   [webUIAdminSettings/adminSharingSettings.feature:8](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminSharingSettings.feature#L8)
-   [webUIAdminSettings/adminSharingSettings.feature:75](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIAdminSettings/adminSharingSettings.feature#L75)

### [File link in notifications seems to not work] (https://github.com/owncloud/web/issues/5227)
-   [webUISharingNotifications/notificationLink.feature:18](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotifications/notificationLink.feature#L18)
-   [webUISharingNotificationsToRoot/notificationLink.feature:17](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotificationsToRoot/notificationLink.feature#L17)