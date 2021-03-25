## Scenarios from web tests that are expected to fail on oC10

Lines that contain a format like "[someSuite.someFeature.feature:n](https://github.com/owncloud/web/path/to/feature)"
are lines that document a specific expected failure. Follow that with a URL to the line in the feature file in GitHub.
Please follow this format for the actual expected failures.

Level-3 headings should be used for the references to the relevant issues. Include the issue title with a link to the issue in GitHub.

Other free text and markdown formatting can be used elsewhere in the document if needed. But if you want to explain something about the issue, then please post that in the issue itself.

### [Media Viewer](https://github.com/owncloud/ocis/issues/1106)
-   [webUIPreview/imageMediaViewer.feature:81](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L81)
-   [webUIPreview/imageMediaViewer.feature:88](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L88)
-   [webUIPreview/imageMediaViewer.feature:33](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L33)
-   [webUIPreview/imageMediaViewer.feature:24](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L24)

### [Media Viewer preview not visible for files with .ogg and .webm formats](https://github.com/owncloud/web/issues/4667)
-   [webUIPreview/imageMediaViewer.feature:136](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L136)
-   [webUIPreview/imageMediaViewer.feature:154](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L154)

### [webUILogin/adminBlocksUser.feature:20 behaves differently on CI] (https://github.com/owncloud/web/issues/4743)
-   [webUILogin/adminBlocksUser.feature:20](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUILogin/adminBlocksUser.feature#L120)

### [sorting for files lists needs to be reimplemented](https://github.com/owncloud/ocis/issues/1179)
-   [webUIFiles/sort.feature:51](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFiles/sort.feature#L51)
-   [webUIFiles/sort.feature:72](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFiles/sort.feature#L72)

### [regression in accepting shares from notifications](https://github.com/owncloud/web/issues/4839)
-   [webUISharingNotificationsToRoot/shareWithUsers.feature:36](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingNotificationsToRoot/shareWithUsers.feature#L36)

### [Preview of a text file is not available even when preview is enabled] (https://github.com/owncloud/web/issues/4858)
-   [webUISharingPublic/shareByPublicLink.feature:61](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUISharingPublic/shareByPublicLink.feature#L61)

### [public cant get access to public link shares] (https://github.com/owncloud/web/issues/4856)
-   [webUIPreview/imageMediaViewer.feature:110](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L110)
