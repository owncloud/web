## Scenarios from web tests that are expected to fail on oC10

Lines that contain a format like "[someSuite.someFeature.feature:n](https://github.com/owncloud/web/path/to/feature)"
are lines that document a specific expected failure. Follow that with a URL to the line in the feature file in GitHub.
Please follow this format for the actual expected failures.

Level-3 headings should be used for the references to the relevant issues. Include the issue title with a link to the issue in GitHub.

Other free text and markdown formatting can be used elsewhere in the document if needed. But if you want to explain something about the issue, then please post that in the issue itself.

### [Media Viewer](https://github.com/owncloud/ocis/issues/1106)
-   [webUIPreview/imageMediaViewer.feature:83](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L83)
-   [webUIPreview/imageMediaViewer.feature:90](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L90)

### [Media Viewer preview not visible for files with .ogg and .webm formats](https://github.com/owncloud/web/issues/4667)
-   [webUIPreview/imageMediaViewer.feature:140](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L140)
-   [webUIPreview/imageMediaViewer.feature:158](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIPreview/imageMediaViewer.feature#L158)

### [WebUI Login](https://github.com/owncloud/web/issues/4677)
-   [webUILogin/openidLogin.feature:62](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUILogin/openidLogin.feature#L62)

### [Browser session deleted user should not be valid for newly created user of same name](https://github.com/owncloud/ocis/issues/904)
-   [webUILogin/openidLogin.feature:74](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUILogin/openidLogin.feature#L74)

### [sorting for files lists needs to be reimplemented](https://github.com/owncloud/ocis/issues/1179)
-   [webUIFilesList/sort.feature:51](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFilesList/sort.feature#L51)
-   [webUIFilesList/sort.feature:72](https://github.com/owncloud/web/blob/master/tests/acceptance/features/webUIFilesList/sort.feature#L72)
