# UI Test suite types
FULL = 1
FEDERATED = 2
NOTIFICATIONS = 3

OC_CI_ALPINE = "owncloudci/alpine:latest"
OC_CI_CORE_NODEJS = "owncloudci/core:nodejs14"
OC_CI_GOLANG = "owncloudci/golang:1.17"
OC_CI_NODEJS = "owncloudci/nodejs:14"
OC_CI_PHP = "owncloudci/php:7.4"

dir = {
    "base": "/var/www/owncloud",
    "federated": "/var/www/owncloud/federated",
    "server": "/var/www/owncloud/server",
    "web": "/var/www/owncloud/web",
}

config = {
    "app": "web",
    "rocketchat": {
        "channel": "builds",
        "from_secret": "private_rocketchat",
    },
    "branches": [
        "master",
    ],
    "yarnlint": True,
    "acceptance": {
        "webUI": {
            "type": FULL,
            "suites": {
                "oC10Basic": [
                    "webUIAccount",
                    "webUILogin",
                    "webUIPreview",
                    "webUIPrivateLinks",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                ],
                "oC10Locks": [
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "oC10CreateDelete": [
                    "webUICreateFilesFolders",
                    "webUIDeleteFilesFolders",
                ],
                "oC10Rename": [
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                ],
                "oC10SharingAccept": [
                    "webUISharingAcceptShares",
                    "webUISharingAcceptSharesToRoot",
                ],
                "oC10Files1": [
                    "webUIFiles",
                    "webUIFilesActionMenu",
                    "webUIFilesCopy",
                    "webUIMarkdownEditor",
                    "webUIFavorites",
                ],
                "oC10Files2": [
                    "webUIFilesDetails",
                    "webUIFilesList",
                    "webUIFilesSearch",
                ],
                "oC10MoveUpload": [
                    "webUIMoveFilesFolders",
                    "webUIUpload",
                    "webUIOperationsWithFolderShares",
                ],
                "oC10Resharing": [
                    "webUIResharing1",
                    "webUIResharing2",
                ],
                "oC10Sharing1": [
                    "webUIRestrictSharing",
                    "webUISharingAutocompletion",
                    "webUISharingExpirationDate",
                ],
                "webUIResharingToRoot": "oC10ResharingToRoot",
                "oC10SharingFilePermission": [
                    "webUISharingFilePermissionMultipleUsers",
                    "webUISharingFilePermissionsGroups",
                ],
                "webUISharingFolderAdvancedPermissionMultipleUsers": "oC10SharingFolderAdvPermMU",
                "webUISharingFolderAdvancedPermissionsGroups": "oC10SharingFolderAdvPermsGrp",
                "oC10SharingFolderPermissions": [
                    "webUISharingFolderPermissionMultipleUsers",
                    "webUISharingFolderPermissionsGroups",
                ],
                "oC10SharingInternalGroups": [
                    "webUISharingInternalGroups",
                    "webUISharingInternalGroupsEdgeCases",
                ],
                "oC10SharingInternalGroupsToRoot": [
                    "webUISharingInternalGroupsToRoot",
                    "webUISharingInternalGroupsToRootEdgeCases",
                ],
                "oC10SharingInternalGroupsSharingInd": [
                    "webUISharingInternalGroupsSharingIndicator",
                    "webUISharingInternalGroupsToRootSharingIndicator",
                ],
                "oC10SharingInternalUsers": [
                    "webUISharingInternalUsers",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                ],
                "webUISharingInternalUsersBlacklisted": "oC10SharingInternalUsersBlacklisted",
                "oC10SharingInternalUsersSharingInd": [
                    "webUISharingInternalUsersSharingIndicator",
                    "webUISharingInternalUsersToRootSharingIndicator",
                ],
                "oC10SharingInternalUsersRoot1": [
                    "webUISharingInternalUsersToRoot",
                    "webUISharingInternalUsersToRootBlacklisted",
                ],
                "oC10SharingInternalUsersRoot2": [
                    "webUISharingInternalUsersToRootCollaborator",
                    "webUISharingInternalUsersToRootPreviews",
                    "webUISharingInternalUsersToRootShareWithPage",
                ],
                "webUISharingPermissionsUsers": "oC10SharingPermissionsUsers",
                "webUISharingPermissionToRoot": "oC10SharingPermissionToRoot",
                "webUISharingPublicBasic": "oC10SharingPublicBasic",
                "webUISharingPublicManagement": "oC10SharingPublicManagement",
                "oC10SharingPublicExpireAndRoles": [
                    "webUISharingPublicDifferentRoles",
                    "webUISharingPublicExpire",
                ],
                "oC10Trashbin": [
                    "webUITrashbinDelete",
                    "webUITrashbinFilesFolders",
                    "webUITrashbinRestore",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-with-oc10-server-oauth2-login.md" % dir["web"],
                "WEB_UI_CONFIG": "%s/dist/config.json" % dir["web"],
            },
            "visualTesting": False,
            "screenShots": False,
        },
        "webUINotification": {
            "type": NOTIFICATIONS,
            "suites": {
                "oC10NotificationBasic": [
                    "webUINotifications",
                ],
                "oC10SharingNotifications": [
                    "webUISharingNotifications",
                    "webUISharingNotificationsToRoot",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-with-oc10-server-oauth2-login.md" % dir["web"],
                "WEB_UI_CONFIG": "%s/dist/config.json" % dir["web"],
            },
            "visualTesting": False,
            "screenShots": False,
            "notificationsAppNeeded": True,
        },
        "webUIFederation": {
            "type": FEDERATED,
            "suites": {
                "webUISharingExternal": "oC10SharingExternal",
                "webUISharingExternalToRoot": "oC10SharingExternalRoot",
            },
            "extraEnvironment": {
                "REMOTE_BACKEND_HOST": "http://federated",
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-with-oc10-server-oauth2-login.md" % dir["web"],
            },
            "notificationsAppNeeded": True,
            "federatedServerNeeded": True,
            "federatedServerVersion": "latest",
        },
        "webUI-XGA-Notifications": {
            "type": NOTIFICATIONS,
            "suites": {
                "oC10XGAPortraitNotifications": [
                    "webUINotifications",
                    "webUISharingNotifications",
                    "webUISharingNotificationsToRoot",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-XGA-with-oc10-server-oauth2-login.md" % dir["web"],
                "SCREEN_RESOLUTION": "768x1024",
            },
            "notificationsAppNeeded": True,
            "filterTags": "@smokeTest and not @skipOnXGAPortraitResolution and not @skip and not @skipOnOC10 and not @notToImplementOnOC10",
        },
        "webUI-XGA": {
            "type": FULL,
            "suites": {
                "oC10XGAPortrait1": [
                    "webUIAccount",
                    "webUICreateFilesFolders",
                    "webUIDeleteFilesFolders",
                    "webUIFavorites",
                    "webUIFiles",
                    "webUIFilesActionMenu",
                    "webUIFilesCopy",
                    "webUIFilesDetails",
                    "webUIFilesList",
                    "webUIFilesSearch",
                    "webUILogin",
                    "webUIOperationsWithFolderShares",
                    "webUIPreview",
                    "webUIPrivateLinks",
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                    "webUIRestrictSharing",
                    "webUISharingAcceptShares",
                    "webUISharingAcceptSharesToRoot",
                    "webUIMarkdownEditor",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "oC10XGAPortrait2": [
                    "webUIMoveFilesFolders",
                    "webUIResharing1",
                    "webUIResharing2",
                    "webUIResharingToRoot",
                    "webUISharingAutocompletion",
                    "webUISharingFilePermissionMultipleUsers",
                    "webUISharingFilePermissionsGroups",
                    "webUISharingFolderAdvancedPermissionMultipleUsers",
                    "webUISharingFolderAdvancedPermissionsGroups",
                    "webUISharingFolderPermissionMultipleUsers",
                    "webUISharingFolderPermissionsGroups",
                    "webUISharingInternalGroups",
                    "webUISharingInternalGroupsEdgeCases",
                    "webUISharingInternalGroupsSharingIndicator",
                    "webUISharingInternalGroupsToRoot",
                    "webUISharingInternalGroupsToRootEdgeCases",
                    "webUISharingInternalGroupsToRootSharingIndicator",
                    "webUISharingInternalUsers",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                    "webUISharingInternalUsersBlacklisted",
                    "webUISharingExpirationDate",
                    "webUISharingInternalUsersSharingIndicator",
                    "webUISharingInternalUsersToRoot",
                    "webUISharingInternalUsersToRootCollaborator",
                    "webUISharingInternalUsersToRootPreviews",
                    "webUISharingInternalUsersToRootShareWithPage",
                    "webUISharingInternalUsersToRootBlacklisted",
                    "webUISharingInternalUsersToRootSharingIndicator",
                    "webUISharingPermissionsUsers",
                    "webUISharingPermissionToRoot",
                    "webUISharingPublicBasic",
                    "webUISharingPublicManagement",
                    "webUISharingPublicDifferentRoles",
                    "webUISharingPublicExpire",
                    "webUITrashbinDelete",
                    "webUITrashbinFilesFolders",
                    "webUITrashbinRestore",
                    "webUIUpload",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-XGA-with-oc10-server-oauth2-login.md" % dir["web"],
                "SCREEN_RESOLUTION": "768x1024",
            },
            "filterTags": "@smokeTest and not @skipOnXGAPortraitResolution and not @skip and not @skipOnOC10 and not @notToImplementOnOC10",
        },
        "webUI-Notifications-iPhone": {
            "type": NOTIFICATIONS,
            "suites": {
                "oC10iPhoneNotifications": [
                    "webUINotifications",
                    "webUISharingNotifications",
                    "webUISharingNotificationsToRoot",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-Iphone-oc10-server-oauth2-login.md" % dir["web"],
                "SCREEN_RESOLUTION": "375x812",
            },
            "notificationsAppNeeded": True,
            "filterTags": "@smokeTest and not @skipOnIphoneResolution and not @skip and not @skipOnOC10 and not @notToImplementOnOC10",
        },
        "webUI-iPhone": {
            "type": FULL,
            "suites": {
                "oC10iPhone1": [
                    "webUIAccount",
                    "webUICreateFilesFolders",
                    "webUIDeleteFilesFolders",
                    "webUIFavorites",
                    "webUIFiles",
                    "webUIFilesActionMenu",
                    "webUIFilesCopy",
                    "webUIFilesDetails",
                    "webUIFilesList",
                    "webUIFilesSearch",
                    "webUILogin",
                    "webUIOperationsWithFolderShares",
                    "webUIPreview",
                    "webUIPrivateLinks",
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                    "webUIRestrictSharing",
                    "webUISharingAcceptShares",
                    "webUISharingAcceptSharesToRoot",
                    "webUIMarkdownEditor",
                    "webUISharingInternalUsersBlacklisted",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "oC10iPhone2": [
                    "webUIMoveFilesFolders",
                    "webUIResharing1",
                    "webUIResharing2",
                    "webUIResharingToRoot",
                    "webUISharingAutocompletion",
                    "webUISharingFilePermissionMultipleUsers",
                    "webUISharingFilePermissionsGroups",
                    "webUISharingFolderAdvancedPermissionMultipleUsers",
                    "webUISharingFolderAdvancedPermissionsGroups",
                    "webUISharingFolderPermissionMultipleUsers",
                    "webUISharingFolderPermissionsGroups",
                    "webUISharingInternalGroups",
                    "webUISharingInternalGroupsEdgeCases",
                    "webUISharingInternalGroupsSharingIndicator",
                    "webUISharingInternalGroupsToRoot",
                    "webUISharingInternalGroupsToRootEdgeCases",
                    "webUISharingInternalGroupsToRootSharingIndicator",
                    "webUISharingInternalUsers",
                    "webUISharingExpirationDate",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                    "webUISharingInternalUsersSharingIndicator",
                    "webUISharingInternalUsersToRootCollaborator",
                    "webUISharingInternalUsersToRootPreviews",
                    "webUISharingInternalUsersToRootShareWithPage",
                    "webUISharingInternalUsersToRootSharingIndicator",
                    "webUISharingInternalUsersToRoot",
                    "webUISharingInternalUsersToRootBlacklisted",
                    "webUISharingPermissionsUsers",
                    "webUISharingPermissionToRoot",
                    "webUISharingPublicBasic",
                    "webUISharingPublicManagement",
                    "webUISharingPublicDifferentRoles",
                    "webUISharingPublicExpire",
                    "webUITrashbinDelete",
                    "webUITrashbinFilesFolders",
                    "webUITrashbinRestore",
                    "webUIUpload",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-Iphone-oc10-server-oauth2-login.md" % dir["web"],
                "SCREEN_RESOLUTION": "375x812",
            },
            "filterTags": "@smokeTest and not @skipOnIphoneResolution and not @skip and not @skipOnOC10 and not @notToImplementOnOC10",
        },
        "webUI-ocis": {
            "type": FULL,
            "servers": [
                "",
            ],
            "suites": {
                "oCISBasic": [
                    "webUILogin",
                    "webUINotifications",
                    "webUIPrivateLinks",
                    "webUIPreview",
                    "webUIAccount",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                ],
                "oCISLocks": [
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "oCISRename": [
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                ],
                "oCISSharingBasic": [
                    "webUISharingAcceptShares",
                    "webUIRestrictSharing",
                    "webUISharingNotifications",
                ],
                "webUIFavorites": "oCISFavorites",
                "oCISFiles1": [
                    "webUICreateFilesFolders",
                    "webUIDeleteFilesFolders",
                    "webUIFiles",
                    "webUIFilesActionMenu",
                    "webUIFilesCopy",
                    "webUIFilesList",
                    "webUIMarkdownEditor",
                ],
                "oCISFiles2": [
                    "webUIFilesDetails",
                    "webUIFilesSearch",
                ],
                "oCISSharingInternalGroups": [
                    "webUISharingInternalGroups",
                    "webUISharingInternalGroupsEdgeCases",
                    "webUISharingInternalGroupsSharingIndicator",
                ],
                "oCISSharingInternalUsers1": [
                    "webUISharingInternalUsers",
                    "webUISharingAutocompletion",
                    "webUISharingExpirationDate",
                ],
                "oCISSharingInternalUsers2": [
                    "webUISharingInternalUsersBlacklisted",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                    "webUISharingInternalUsersSharingIndicator",
                ],
                "oCISSharingPermissions1": [
                    "webUISharingPermissionsUsers",
                    "webUISharingFilePermissionsGroups",
                ],
                "oCISSharingPermissions2": [
                    "webUISharingFolderPermissionsGroups",
                    "webUISharingFolderAdvancedPermissionsGroups",
                ],
                "oCISSharingPermissions3": [
                    "webUISharingFilePermissionMultipleUsers",
                    "webUISharingFolderPermissionMultipleUsers",
                    "webUISharingFolderAdvancedPermissionMultipleUsers",
                ],
                "oCISResharing1": [
                    "webUIResharing1",
                    "webUIResharing2",
                ],
                "oCISSharingPublic": [
                    "webUISharingPublicBasic",
                    "webUISharingPublicManagement",
                ],
                "oCISSharingPublicExpireAndRoles": [
                    "webUISharingPublicDifferentRoles",
                    "webUISharingPublicExpire",
                ],
                "oCISTrashbinUploadMoveJourney": [
                    "webUITrashbinDelete",
                    "webUITrashbinFilesFolders",
                    "webUITrashbinRestore",
                    "webUIUpload",
                    "webUIMoveFilesFolders",
                    "webUIUserJourney",
                    "webUIOperationsWithFolderShares",
                ],
            },
            "extraEnvironment": {
                "NODE_TLS_REJECT_UNAUTHORIZED": "0",
                "SERVER_HOST": "https://ocis:9200",
                "BACKEND_HOST": "https://ocis:9200",
                "RUN_ON_OCIS": "true",
                "TESTING_DATA_DIR": "/srv/app/testing/data/",
                "OCIS_REVA_DATA_ROOT": "/srv/app/tmp/ocis/owncloud/data/",
                "WEB_UI_CONFIG": "/srv/config/drone/config-ocis.json",
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-with-ocis-server-ocis-storage.md" % dir["web"],
            },
            "runningOnOCIS": True,
            "visualTesting": False,
            "filterTags": "not @skip and not @skipOnOCIS and not @notToImplementOnOCIS",
        },
        "webUI-notifications-oc10-integration": {
            "type": NOTIFICATIONS,
            "suites": {
                "oC10IntegrationNotifications": [
                    "webUINotifications",
                    "webUISharingNotifications",
                    "webUISharingNotificationsToRoot",
                ],
            },
            "extraEnvironment": {
                "WEB_UI_CONFIG": "/srv/config/drone/config-oc10-integration-app-oauth.json",
                "SERVER_HOST": "http://owncloud/index.php/apps/web/index.html",
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-with-oc10-server-oauth2-login-and-web-integration-app.md" % dir["web"],
            },
            "filterTags": "not @skip and not @skipOnOC10 and not @notToImplementOnOC10 and not @openIdLogin and @smokeTest",
            "oc10IntegrationAppIncluded": True,
            "notificationsAppNeeded": True,
            "screenShots": False,
        },
        "webUI-oc10-integration": {
            "type": FULL,
            "suites": {
                "oC10IntegrationApp1": [
                    "webUIAccount",
                    "webUICreateFilesFolders",
                    "webUIDeleteFilesFolders",
                    "webUIFavorites",
                    "webUIFiles",
                    "webUIFilesActionMenu",
                    "webUIFilesCopy",
                    "webUIFilesDetails",
                    "webUIFilesList",
                    "webUIFilesSearch",
                    "webUILogin",
                    "webUIOperationsWithFolderShares",
                    "webUIPreview",
                    "webUIPrivateLinks",
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                    "webUIRestrictSharing",
                    "webUISharingAcceptShares",
                    "webUISharingAcceptSharesToRoot",
                    "webUIMarkdownEditor",
                    "webUISharingInternalUsersBlacklisted",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "oC10IntegrationApp2": [
                    "webUIMoveFilesFolders",
                    "webUIResharing1",
                    "webUIResharing2",
                    "webUIResharingToRoot",
                    "webUISharingAutocompletion",
                    "webUISharingFilePermissionMultipleUsers",
                    "webUISharingFilePermissionsGroups",
                    "webUISharingFolderAdvancedPermissionMultipleUsers",
                    "webUISharingFolderAdvancedPermissionsGroups",
                    "webUISharingFolderPermissionMultipleUsers",
                    "webUISharingFolderPermissionsGroups",
                    "webUISharingInternalGroups",
                    "webUISharingInternalGroupsEdgeCases",
                    "webUISharingInternalGroupsSharingIndicator",
                    "webUISharingInternalGroupsToRoot",
                    "webUISharingInternalGroupsToRootEdgeCases",
                    "webUISharingInternalGroupsToRootSharingIndicator",
                    "webUISharingInternalUsers",
                    "webUISharingExpirationDate",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                    "webUISharingInternalUsersSharingIndicator",
                    "webUISharingInternalUsersToRootCollaborator",
                    "webUISharingInternalUsersToRootPreviews",
                    "webUISharingInternalUsersToRootShareWithPage",
                    "webUISharingInternalUsersToRootSharingIndicator",
                    "webUISharingInternalUsersToRoot",
                    "webUISharingInternalUsersToRootBlacklisted",
                    "webUISharingPermissionsUsers",
                    "webUISharingPermissionToRoot",
                    "webUISharingPublicBasic",
                    "webUISharingPublicManagement",
                    "webUISharingPublicDifferentRoles",
                    "webUISharingPublicExpire",
                    "webUITrashbinDelete",
                    "webUITrashbinFilesFolders",
                    "webUITrashbinRestore",
                    "webUIUpload",
                ],
            },
            "extraEnvironment": {
                "WEB_UI_CONFIG": "/srv/config/drone/config-oc10-integration-app-oauth.json",
                "SERVER_HOST": "http://owncloud/index.php/apps/web/index.html",
                "EXPECTED_FAILURES_FILE": "%s/tests/acceptance/expected-failures-with-oc10-server-oauth2-login-and-web-integration-app.md" % dir["web"],
            },
            "filterTags": "not @skip and not @skipOnOC10 and not @notToImplementOnOC10 and not @openIdLogin and @smokeTest",
            "oc10IntegrationAppIncluded": True,
            "screenShots": False,
        },
    },
    "build": True,
}

# UI Test Suites
# These list contains all the test suites that are present
# When adding new test suites, make sure to update these lists
federatedTestSuites = [
    "webUISharingExternal",
]

federatedRootTestSuites = [
    "webUISharingExternalToRoot",
]

rootSharingTestSuites = [
    "webUIResharingToRoot",
    "webUISharingAcceptSharesToRoot",
    "webUISharingInternalGroupsToRoot",
    "webUISharingInternalGroupsToRootEdgeCases",
    "webUISharingInternalGroupsToRootSharingIndicator",
    "webUISharingInternalUsersToRoot",
    "webUISharingInternalUsersToRootBlacklisted",
    "webUISharingInternalUsersToRootCollaborator",
    "webUISharingInternalUsersToRootPreviews",
    "webUISharingInternalUsersToRootShareWithPage",
    "webUISharingInternalUsersToRootSharingIndicator",
    "webUISharingPermissionToRoot",
]

notificationsTestSuites = [
    "webUINotifications",
    "webUISharingNotifications",
]

notificationsRootTestSuites = [
    "webUISharingNotificationsToRoot",
]

basicTestSuites = [
    "webUIAccount",
    "webUICreateFilesFolders",
    "webUIDeleteFilesFolders",
    "webUIFavorites",
    "webUIFiles",
    "webUIFilesActionMenu",
    "webUIFilesCopy",
    "webUIFilesDetails",
    "webUIFilesList",
    "webUIFilesSearch",
    "webUILogin",
    "webUIMarkdownEditor",
    "webUIMoveFilesFolders",
    "webUIOperationsWithFolderShares",
    "webUIPreview",
    "webUIPrivateLinks",
    "webUIRenameFiles",
    "webUIRenameFolders",
    "webUIResharing1",
    "webUIResharing2",
    "webUIRestrictSharing",
    "webUISharingAcceptShares",
    "webUISharingAutocompletion",
    "webUISharingFilePermissionMultipleUsers",
    "webUISharingFilePermissionsGroups",
    "webUISharingFolderAdvancedPermissionMultipleUsers",
    "webUISharingFolderAdvancedPermissionsGroups",
    "webUISharingFolderPermissionMultipleUsers",
    "webUISharingFolderPermissionsGroups",
    "webUISharingInternalGroups",
    "webUISharingInternalGroupsEdgeCases",
    "webUISharingInternalGroupsSharingIndicator",
    "webUISharingInternalUsers",
    "webUISharingInternalUsersBlacklisted",
    "webUISharingInternalUsersCollaborator",
    "webUISharingExpirationDate",
    "webUISharingInternalUsersShareWithPage",
    "webUISharingInternalUsersSharingIndicator",
    "webUISharingPermissionsUsers",
    "webUISharingPublicBasic",
    "webUISharingPublicDifferentRoles",
    "webUISharingPublicExpire",
    "webUISharingPublicManagement",
    "webUITrashbinDelete",
    "webUITrashbinFilesFolders",
    "webUITrashbinRestore",
    "webUIUpload",
    "webUIWebdavLockProtection",
    "webUIWebdavLocks",
]

ocisSpecificTestSuites = [
    "webUIUserJourney",
]

def checkTestSuites():
    for testGroupName, test in config["acceptance"].items():
        suites = []
        for key, items in test["suites"].items():
            if (type(items) == "list"):
                suites += items
            elif (type(items) == "string"):
                suites += [key]
            else:
                print("Error: invalid value for suite, it must be a list or string")
                return False

        expected = []
        if (test["type"] == FULL):
            expected += basicTestSuites
            if ("runningOnOCIS" not in test or test["runningOnOCIS"] != True):
                expected += rootSharingTestSuites
        elif (test["type"] == NOTIFICATIONS):
            expected += notificationsTestSuites
            if ("runningOnOCIS" not in test or test["runningOnOCIS"] != True):
                expected += notificationsRootTestSuites
        elif (test["type"] == FEDERATED):
            expected += federatedTestSuites + federatedRootTestSuites

        if ("runningOnOCIS" in test and test["runningOnOCIS"] == True):
            expected += notificationsTestSuites + ocisSpecificTestSuites

        if (sorted(suites) != sorted(expected)):
            print("Error: Suites dont match " + testGroupName)
            print(Diff(sorted(suites), sorted(expected)))

    return True

def Diff(li1, li2):
    li_dif = [i for i in li1 + li2 if i not in li1 or i not in li2]
    return li_dif

def main(ctx):
    uiSuitesCheck = checkTestSuites()
    if (uiSuitesCheck == False):
        print("Errors detected. Review messages above.")
        return []

    before = beforePipelines(ctx)

    stages = pipelinesDependsOn(stagePipelines(ctx), before)

    if (stages == False):
        print("Errors detected. Review messages above.")
        return []

    after = pipelinesDependsOn(afterPipelines(ctx), stages)

    pipelines = before + stages + after

    deploys = example_deploys(ctx)
    if ctx.build.event != "cron":
        # run example deploys on cron even if some prior pipelines fail
        deploys = pipelinesDependsOn(deploys, pipelines)

    pipelines = pipelines + deploys

    pipelineSanityChecks(ctx, pipelines)
    return pipelines

def beforePipelines(ctx):
    return checkForRecentBuilds(ctx) + \
           checkStarlark() + \
           documentation(ctx) + \
           changelog(ctx) + \
           yarnCache(ctx) + \
           cacheOcisPipeline(ctx) + \
           pipelinesDependsOn(buildCacheWeb(ctx), yarnCache(ctx)) + \
           pipelinesDependsOn(yarnlint(ctx), yarnCache(ctx))

def stagePipelines(ctx):
    title = ctx.build.title.lower()
    if "docs-only" in title:
        return []

    unit_test_pipelines = unitTests(ctx)
    if "unit-tests-only" in title:
        return unit_test_pipelines

    acceptance_pipelines = acceptance(ctx)
    if ("acceptance-tests-only" in title):
        return acceptance_pipelines

    return unit_test_pipelines + pipelinesDependsOn(acceptance_pipelines, unit_test_pipelines)

def afterPipelines(ctx):
    return build(ctx) + notify()

def yarnCache(ctx):
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "cache-yarn",
        "steps": skipIfUnchanged(ctx, "cache") +
                 installYarn() + yarnInstallTests() +
                 rebuildBuildArtifactCache(ctx, ".yarn", ".yarn"),
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def yarnlint(ctx):
    pipelines = []

    if "yarnlint" not in config:
        return pipelines

    if type(config["yarnlint"]) == "bool":
        if not config["yarnlint"]:
            return pipelines

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "lint",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": skipIfUnchanged(ctx, "lint") +
                 restoreBuildArtifactCache(ctx, ".yarn", ".yarn") +
                 installYarn() +
                 lint(),
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }

    for branch in config["branches"]:
        result["trigger"]["ref"].append("refs/heads/%s" % branch)

    pipelines.append(result)

    return pipelines

def checkForRecentBuilds(ctx):
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "stop-recent-builds",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": [{
            "name": "stop-recent-builds",
            "image": "drone/cli:alpine",
            "environment": {
                "DRONE_SERVER": "https://drone.owncloud.com",
                "DRONE_TOKEN": {
                    "from_secret": "drone_token",
                },
            },
            "commands": [
                "drone build ls %s --status running > %s/recentBuilds.txt" % (ctx.repo.slug, dir["web"]),
                "drone build info %s ${DRONE_BUILD_NUMBER} > %s/thisBuildInfo.txt" % (ctx.repo.slug, dir["web"]),
                "cd %s && ./tests/acceptance/cancelBuilds.sh" % dir["web"],
            ],
        }],
        "trigger": {
            "ref": [
                "refs/pull/**",
            ],
        },
    }]

def build(ctx):
    pipelines = []

    if "build" not in config:
        return pipelines

    if type(config["build"]) == "bool":
        if not config["build"]:
            return pipelines

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "build",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": restoreBuildArtifactCache(ctx, ".yarn", ".yarn") +
                 installYarn() +
                 buildRelease(ctx) +
                 buildDockerImage(),
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/tags/**",
            ],
        },
    }

    pipelines.append(result)

    return pipelines

def changelog(ctx):
    pipelines = []
    repo_slug = ctx.build.source_repo if ctx.build.source_repo else ctx.repo.slug

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "changelog",
        "clone": {
            "disable": True,
        },
        "steps": [
            {
                "name": "clone",
                "image": "plugins/git-action:1",
                "settings": {
                    "actions": [
                        "clone",
                    ],
                    "remote": "https://github.com/%s" % (repo_slug),
                    "branch": ctx.build.source if ctx.build.event == "pull_request" else "master",
                    "path": "/drone/src",
                    "netrc_machine": "github.com",
                    "netrc_username": {
                        "from_secret": "github_username",
                    },
                    "netrc_password": {
                        "from_secret": "github_token",
                    },
                },
            },
            {
                "name": "generate",
                "image": "toolhippie/calens:latest",
                "commands": [
                    "calens >| CHANGELOG.md",
                ],
            },
            {
                "name": "diff",
                "image": OC_CI_ALPINE,
                "commands": [
                    "git diff",
                ],
            },
            {
                "name": "output",
                "image": "toolhippie/calens:latest",
                "commands": [
                    "cat CHANGELOG.md",
                ],
            },
            {
                "name": "publish",
                "image": "plugins/git-action:1",
                "settings": {
                    "actions": [
                        "commit",
                        "push",
                    ],
                    "message": "Automated changelog update [skip ci]",
                    "branch": "master",
                    "author_email": "devops@owncloud.com",
                    "author_name": "ownClouders",
                    "netrc_machine": "github.com",
                    "netrc_username": {
                        "from_secret": "github_username",
                    },
                    "netrc_password": {
                        "from_secret": "github_token",
                    },
                },
                "when": {
                    "ref": {
                        "exclude": [
                            "refs/pull/**",
                            "refs/tags/**",
                        ],
                    },
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/pull/**",
            ],
        },
    }

    pipelines.append(result)

    return pipelines

def buildCacheWeb(ctx):
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "cache-web",
        "steps": skipIfUnchanged(ctx, "cache") +
                 restoreBuildArtifactCache(ctx, ".yarn", ".yarn") +
                 installYarn() +
                 [{
                     "name": "build-web",
                     "image": "owncloudci/nodejs:14",
                     "commands": [
                         "make dist",
                     ],
                 }] +
                 rebuildBuildArtifactCache(ctx, "web-dist", "dist"),
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def unitTests(ctx):
    sonar_env = {
        "SONAR_TOKEN": {
            "from_secret": "sonar_token",
        },
    }
    if ctx.build.event == "pull_request":
        sonar_env.update({
            "SONAR_PULL_REQUEST_BASE": "%s" % (ctx.build.target),
            "SONAR_PULL_REQUEST_BRANCH": "%s" % (ctx.build.source),
            "SONAR_PULL_REQUEST_KEY": "%s" % (ctx.build.ref.replace("refs/pull/", "").split("/")[0]),
        })

    repo_slug = ctx.build.source_repo if ctx.build.source_repo else ctx.repo.slug

    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "unit-and-integration-tests",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "clone": {
            "disable": True,  # Sonarcloud does not apply issues on already merged branch
        },
        "steps": [{
                     "name": "clone",
                     "image": OC_CI_ALPINE,
                     "commands": [
                         "git clone https://github.com/%s.git ." % (repo_slug),
                         "git checkout $DRONE_COMMIT",
                     ],
                 }] +
                 skipIfUnchanged(ctx, "unit-tests") +
                 restoreBuildArtifactCache(ctx, ".yarn", ".yarn") +
                 installYarn() +
                 restoreBuildArtifactCache(ctx, "web-dist", "dist") +
                 [
                     {
                         "name": "unit-tests",
                         "image": OC_CI_NODEJS,
                         "commands": [
                             "yarn test:unit",
                         ],
                     },
                     {
                         "name": "integration-tests",
                         "image": OC_CI_NODEJS,
                         "commands": [
                             "yarn test:integration",
                         ],
                     },
                     {
                         "name": "sonarcloud",
                         "image": "sonarsource/sonar-scanner-cli:latest",
                         "environment": sonar_env,
                     },
                 ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def acceptance(ctx):
    pipelines = []

    if "acceptance" not in config:
        return pipelines

    if type(config["acceptance"]) == "bool":
        if not config["acceptance"]:
            return pipelines

    errorFound = False

    default = {
        "servers": ["latest"],
        "browsers": ["chrome"],
        "databases": ["mysql:5.5"],
        "extraEnvironment": {},
        "cronOnly": False,
        "filterTags": "not @skip and not @skipOnOC10 and not @notToImplementOnOC10 and not @openIdLogin",
        "logLevel": "2",
        "notificationsAppNeeded": False,
        "federatedServerNeeded": False,
        "federatedServerVersion": "latest",
        "runningOnOCIS": False,
        "screenShots": False,
        "visualTesting": False,
        "openIdConnect": False,
        "oc10IntegrationAppIncluded": False,
        "skip": False,
        "debugSuites": [],
        "earlyFail": True,
    }

    if "defaults" in config:
        if "acceptance" in config["defaults"]:
            for item in config["defaults"]["acceptance"]:
                default[item] = config["defaults"]["acceptance"][item]

    for category, matrix in config["acceptance"].items():
        if type(matrix["suites"]) == "list":
            suites = {}
            for suite in matrix["suites"]:
                suites[suite] = suite
        else:
            suites = matrix["suites"]

        if "debugSuites" in matrix and len(matrix["debugSuites"]) != 0:
            if type(matrix["debugSuites"]) == "list":
                suites = {}
                for suite in matrix["debugSuites"]:
                    suites[suite] = suite
            else:
                suites = matrix["debugSuites"]

        for key, value in suites.items():
            if type(value) == "list":
                suite = value
                suiteName = key
                alternateSuiteName = key
            else:
                suite = key
                alternateSuiteName = value
                suiteName = value

            params = {}
            for item in default:
                params[item] = matrix[item] if item in matrix else default[item]

            if ("full-ci" in ctx.build.title.lower()):
                params["earlyFail"] = False

            for server in params["servers"]:
                for browser in params["browsers"]:
                    for db in params["databases"]:
                        if params["skip"]:
                            continue
                        federatedServerVersion = params["federatedServerVersion"]
                        federationDbSuffix = "-federated"

                        if params["federatedServerNeeded"] and getDbName(db) not in ["mariadb", "mysql"]:
                            errorFound = True

                        browserString = "" if browser == "" else "-" + browser
                        serverString = "" if server == "" else "-" + server.replace("daily-", "").replace("-qa", "")
                        name = "%s%s%s" % (suiteName, browserString, serverString)
                        maxLength = 50
                        nameLength = len(name)
                        if nameLength > maxLength:
                            print("Error: generated stage name of length", nameLength, "is not supported. The maximum length is " + str(maxLength) + ".", name)
                            errorFound = True

                        steps = []

                        # TODO: don't start services if we skip it -> maybe we need to convert them to steps
                        steps += skipIfUnchanged(ctx, "acceptance-tests")

                        steps += restoreBuildArtifactCache(ctx, ".yarn", ".yarn")
                        steps += yarnInstallTests()

                        if (params["oc10IntegrationAppIncluded"]):
                            steps += installYarn() + buildWebApp()
                        else:
                            steps += restoreBuildArtifactCache(ctx, "web-dist", "dist")
                            steps += setupServerConfigureWeb(params["logLevel"])

                        services = browserService(alternateSuiteName, browser)

                        if (params["runningOnOCIS"]):
                            # Services and steps required for running tests with oCIS
                            steps += getOcis() + ocisService() + getSkeletonFiles()

                        else:
                            # Services and steps required for running tests with oc10
                            services += databaseService(db) + owncloudService()

                            ## prepare oc10 server
                            if server == "":
                                server = False

                            steps += installCore(server, db) + owncloudLog()

                            if (params["oc10IntegrationAppIncluded"]):
                                steps += setupIntegrationWebApp()
                                steps += setupServerAndAppsForIntegrationApp(params["logLevel"])
                            else:
                                steps += setupServerAndApp(params["logLevel"])

                            if params["notificationsAppNeeded"]:
                                steps += setupNotificationsAppForServer()

                            if (params["openIdConnect"]):
                                ## Configure oc10 and web with openidConnect login
                                steps += setupGraphapiOIdC() + buildGlauth() + buildIdP() + buildOcisWeb()
                                steps += idpService() + ocisWebService() + glauthService()
                            else:
                                ## Configure oc10 and web with oauth2 and web Service
                                steps += setUpOauth2(params["oc10IntegrationAppIncluded"])
                                services += webService()

                            steps += fixPermissions()

                            if (params["federatedServerNeeded"]):
                                if federatedServerVersion == "":
                                    federatedServerVersion = False

                                # services and steps required to run federated sharing tests
                                steps += installFederatedServer(federatedServerVersion, db, federationDbSuffix) + setupFedServerAndApp(params["logLevel"])
                                steps += fixPermissionsFederated() + owncloudLogFederated()

                                services += owncloudFederatedService() + databaseServiceForFederation(db, federationDbSuffix)

                        # Copy files for upload
                        steps += copyFilesForUpload()

                        # run the acceptance tests
                        steps += runWebuiAcceptanceTests(ctx, suite, alternateSuiteName, params["filterTags"], params["extraEnvironment"], browser, params["visualTesting"], params["screenShots"])

                        # capture the screenshots from visual regression testing (only runs on failure)
                        if (params["visualTesting"]):
                            steps += listScreenShots() + uploadVisualDiff() + uploadVisualScreenShots()
                            steps += buildGithubCommentVisualDiff(ctx, suiteName, params["runningOnOCIS"])

                        # Capture the screenshots from acceptance tests (only runs on failure)
                        if (isLocalBrowser(browser) and params["screenShots"]):
                            steps += uploadScreenshots() + buildGithubComment(suiteName)

                        if (params["earlyFail"]):
                            steps += buildGithubCommentForBuildStopped(suiteName)

                        # Upload the screenshots to github comment
                        steps += githubComment(alternateSuiteName)

                        if (params["earlyFail"]):
                            steps += stopBuild()

                        result = {
                            "kind": "pipeline",
                            "type": "docker",
                            "name": name,
                            "workspace": {
                                "base": dir["base"],
                                "path": config["app"],
                            },
                            "steps": steps,
                            "services": services,
                            "trigger": {
                                "ref": [
                                    "refs/tags/**",
                                    "refs/pull/**",
                                ],
                            },
                            "volumes": [{
                                "name": "uploads",
                                "temp": {},
                            }, {
                                "name": "configs",
                                "temp": {},
                            }, {
                                "name": "gopath",
                                "temp": {},
                            }],
                        }

                        if params["runningOnOCIS"]:
                            result = pipelineDependsOn(result, cacheOcisPipeline(ctx))

                        for branch in config["branches"]:
                            result["trigger"]["ref"].append("refs/heads/%s" % branch)

                        if (params["cronOnly"]):
                            result["trigger"]["event"] = ["cron"]

                        pipelines.append(result)

    if errorFound:
        return False

    return pipelines

def notify():
    pipelines = []

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "chat-notifications",
        "clone": {
            "disable": True,
        },
        "steps": [
            {
                "name": "notify-rocketchat",
                "image": "plugins/slack:1",
                "settings": {
                    "webhook": {
                        "from_secret": config["rocketchat"]["from_secret"],
                    },
                    "channel": config["rocketchat"]["channel"],
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/tags/**",
            ],
            "status": [
                "success",
                "failure",
            ],
        },
    }

    for branch in config["branches"]:
        result["trigger"]["ref"].append("refs/heads/%s" % branch)

    pipelines.append(result)

    return pipelines

def databaseServiceForFederation(db, suffix):
    dbName = getDbName(db)

    # only support mariadb, for web, it's not important to support others
    if dbName not in ["mariadb", "mysql"]:
        print("Not implemented federated database for", dbName)
        return []

    return [{
        "name": dbName + suffix,
        "image": db,
        "environment": {
            "MYSQL_USER": getDbUsername(db),
            "MYSQL_PASSWORD": getDbPassword(db),
            "MYSQL_DATABASE": getDbDatabase(db) + suffix,
            "MYSQL_ROOT_PASSWORD": getDbRootPassword(),
        },
    }]

def databaseService(db):
    dbName = getDbName(db)
    if (dbName == "mariadb") or (dbName == "mysql"):
        return [{
            "name": dbName,
            "image": db,
            "environment": {
                "MYSQL_USER": getDbUsername(db),
                "MYSQL_PASSWORD": getDbPassword(db),
                "MYSQL_DATABASE": getDbDatabase(db),
                "MYSQL_ROOT_PASSWORD": getDbRootPassword(),
            },
        }]

    if dbName == "postgres":
        return [{
            "name": dbName,
            "image": db,
            "environment": {
                "POSTGRES_USER": getDbUsername(db),
                "POSTGRES_PASSWORD": getDbPassword(db),
                "POSTGRES_DB": getDbDatabase(db),
            },
        }]

    if dbName == "oracle":
        return [{
            "name": dbName,
            "image": "deepdiver/docker-oracle-xe-11g:latest",
            "environment": {
                "ORACLE_USER": getDbUsername(db),
                "ORACLE_PASSWORD": getDbPassword(db),
                "ORACLE_DB": getDbDatabase(db),
                "ORACLE_DISABLE_ASYNCH_IO": "true",
            },
        }]

    return []

def browserService(alternateSuiteName, browser):
    if browser == "chrome":
        return [{
            "name": "selenium",
            "image": "selenium/standalone-chrome-debug:3.141.59",
            "volumes": [{
                "name": "uploads",
                "path": "/uploads",
            }],
        }]

    if browser == "firefox":
        return [{
            "name": "selenium",
            "image": "selenium/standalone-firefox-debug:3.141.59",
            "volumes": [{
                "name": "uploads",
                "path": "/uploads",
            }],
        }]

    if not isLocalBrowser(browser):
        return [{
            "name": "saucelabs",
            "image": "henrrich/docker-sauce-connect:latest",
            "pull": "if-not-exists",
            "environment": {
                "SAUCE_USERNAME": {
                    "from_secret": "sauce_username",
                },
                "SAUCE_ACCESS_KEY": {
                    "from_secret": "sauce_access_key",
                },
            },
            "commands": [
                "/usr/local/sauce-connect/bin/sc -i %s" % getSaucelabsTunnelName(alternateSuiteName, browser),
            ],
        }]

    return []

def owncloudService():
    return [{
        "name": "owncloud",
        "image": OC_CI_PHP,
        "environment": {
            "APACHE_WEBROOT": "%s/" % dir["server"],
            "APACHE_LOGGING_PATH": "/dev/null",
        },
        "command": [
            "/usr/local/bin/apachectl",
            "-D",
            "FOREGROUND",
        ],
    }]

def owncloudFederatedService():
    return [{
        "name": "federated",
        "image": OC_CI_PHP,
        "environment": {
            "APACHE_WEBROOT": "%s/" % dir["federated"],
            "APACHE_LOGGING_PATH": "/dev/null",
        },
        "command": [
            "/usr/local/bin/apachectl",
            "-D",
            "FOREGROUND",
        ],
    }]

def getDbName(db):
    return db.split(":")[0]

def getDbUsername(db):
    name = getDbName(db)

    if name == "oracle":
        return "system"

    return "owncloud"

def getDbPassword(db):
    name = getDbName(db)

    if name == "oracle":
        return "oracle"

    return "owncloud"

def getDbRootPassword():
    return "owncloud"

def getDbDatabase(db):
    name = getDbName(db)

    if name == "oracle":
        return "XE"

    return "owncloud"

def getSaucelabsTunnelName(alternateSuiteName, browser):
    return "${DRONE_BUILD_NUMBER}-acceptance-%s-%s" % (alternateSuiteName, browser)

def getSaucelabsBrowserName(browser):
    if (browser == "IE11"):
        return "internet explorer"
    if (browser == "Edge"):
        return "MicrosoftEdge"
    return browser

def isLocalBrowser(browser):
    return ((browser == "chrome") or (browser == "firefox"))

def installCore(version, db):
    host = getDbName(db)
    dbType = host

    username = getDbUsername(db)
    password = getDbPassword(db)
    database = getDbDatabase(db)

    if host == "mariadb":
        dbType = "mysql"

    if host == "postgres":
        dbType = "pgsql"

    if host == "oracle":
        dbType = "oci"

    stepDefinition = {
        "name": "install-core",
        "image": OC_CI_CORE_NODEJS,
    }

    if version:
        stepDefinition.update({"settings": {
            "version": version,
            "core_path": dir["server"],
            "db_type": dbType,
            "db_name": database,
            "db_host": host,
            "db_username": username,
            "db_password": password,
        }})
    else:
        stepDefinition.update({"settings": {
            "core_path": dir["server"],
            "db_type": dbType,
            "db_name": database,
            "db_host": host,
            "db_username": username,
            "db_password": password,
        }})
        stepDefinition.update({"commands": [
            "bash /usr/sbin/plugin.sh",
        ]})

    return [stepDefinition]

def installFederatedServer(version, db, dbSuffix = "-federated"):
    host = getDbName(db)
    dbType = host

    username = getDbUsername(db)
    password = getDbPassword(db)
    database = getDbDatabase(db) + dbSuffix

    if host == "mariadb":
        dbType = "mysql"
    elif host == "postgres":
        dbType = "pgsql"
    elif host == "oracle":
        dbType = "oci"

    stepDefinition = {
        "name": "install-federated",
        "image": OC_CI_CORE_NODEJS,
    }
    if version:
        stepDefinition.update({"settings": {
            "version": version,
            "core_path": "%s/" % dir["federated"],
            "db_type": dbType,
            "db_name": database,
            "db_host": host + dbSuffix,
            "db_username": username,
            "db_password": password,
        }})
    else:
        stepDefinition.update({"settings": {
            "core_path": "%s/" % dir["federated"],
            "db_type": dbType,
            "db_name": database,
            "db_host": host + dbSuffix,
            "db_username": username,
            "db_password": password,
        }})
        stepDefinition.update({"commands": [
            "bash /usr/sbin/plugin.sh",
        ]})

    return [stepDefinition]

def installYarn():
    return [{
        "name": "yarn-install",
        "image": OC_CI_NODEJS,
        "commands": [
            "yarn install --immutable",
        ],
    }]

def yarnInstallTests():
    return [{
        "name": "yarn-install-tests",
        "image": OC_CI_NODEJS,
        "pull": "always",
        "commands": [
            "cd tests/acceptance && yarn install --immutable",
        ],
    }]

def lint():
    return [{
        "name": "lint",
        "image": OC_CI_NODEJS,
        "commands": [
            "yarn run lint",
        ],
    }]

def buildWebApp():
    return [{
        "name": "build-web-integration-app",
        "image": OC_CI_NODEJS,
        "commands": [
            "bash -x tests/drone/build-web-app.sh {}".format(dir["web"]),
        ],
        "volumes": [{
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def setupIntegrationWebApp():
    return [{
        "name": "setup-web-integration-app",
        "image": OC_CI_PHP,
        "commands": [
            "bash -x tests/drone/setup-integration-web-app.sh {} {}".format(dir["server"], dir["web"]),
        ],
        "volumes": [{
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def buildDockerImage():
    return [{
        "name": "docker",
        "image": "plugins/docker:18.09",
        "settings": {
            "username": {
                "from_secret": "docker_username",
            },
            "password": {
                "from_secret": "docker_password",
            },
            "auto_tag": True,
            "dockerfile": "docker/Dockerfile",
            "repo": "owncloud/web",
        },
        "when": {
            "ref": {
                "exclude": [
                    "refs/pull/**",
                ],
            },
        },
    }]

def buildRelease(ctx):
    return [
        {
            "name": "make",
            "image": OC_CI_NODEJS,
            "commands": [
                "cd %s" % dir["web"],
                "make -f Makefile.release",
            ],
        },
        {
            "name": "changelog",
            "image": "toolhippie/calens:latest",
            "commands": [
                "calens --version %s -o dist/CHANGELOG.md -t changelog/CHANGELOG-Release.tmpl" % ctx.build.ref.replace("refs/tags/v", "").split("-")[0],
            ],
            "when": {
                "ref": [
                    "refs/tags/**",
                ],
            },
        },
        {
            "name": "publish",
            "image": "plugins/github-release:1",
            "settings": {
                "api_key": {
                    "from_secret": "github_token",
                },
                "files": [
                    "release/*",
                ],
                "checksum": [
                    "md5",
                    "sha256",
                ],
                "title": ctx.build.ref.replace("refs/tags/v", ""),
                "note": "dist/CHANGELOG.md",
                "overwrite": True,
            },
            "when": {
                "ref": [
                    "refs/tags/**",
                ],
            },
        },
    ]

def documentation(ctx):
    return [
        {
            "kind": "pipeline",
            "type": "docker",
            "name": "documentation",
            "platform": {
                "os": "linux",
                "arch": "amd64",
            },
            "steps": [
                {
                    "name": "prepare",
                    "image": OC_CI_ALPINE,
                    "commands": [
                        "make docs-copy",
                    ],
                },
                {
                    "name": "test",
                    "image": "owncloudci/hugo:0.71.0",
                    "commands": [
                        "cd hugo",
                        "hugo",
                    ],
                },
                {
                    "name": "list",
                    "image": OC_CI_ALPINE,
                    "commands": [
                        "tree hugo/public",
                    ],
                },
                {
                    "name": "publish",
                    "image": "plugins/gh-pages:1",
                    "settings": {
                        "username": {
                            "from_secret": "github_username",
                        },
                        "password": {
                            "from_secret": "github_token",
                        },
                        "pages_directory": "docs/",
                        "target_branch": "docs",
                    },
                    "when": {
                        "ref": {
                            "exclude": [
                                "refs/pull/**",
                            ],
                        },
                    },
                },
                {
                    "name": "downstream",
                    "image": "plugins/downstream",
                    "settings": {
                        "server": "https://drone.owncloud.com/",
                        "token": {
                            "from_secret": "drone_token",
                        },
                        "repositories": [
                            "owncloud/owncloud.github.io@source",
                        ],
                    },
                    "when": {
                        "ref": {
                            "exclude": [
                                "refs/pull/**",
                            ],
                        },
                    },
                },
            ],
            "trigger": {
                "ref": [
                    "refs/heads/master",
                    "refs/pull/**",
                ],
            },
        },
    ]

def getSkeletonFiles():
    return [{
        "name": "setup-skeleton-files",
        "image": OC_CI_PHP,
        "commands": [
            "git clone https://github.com/owncloud/testing.git /srv/app/testing",
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }],
    }]

def webService():
    return [{
        "name": "web",
        "image": OC_CI_PHP,
        "environment": {
            "APACHE_WEBROOT": "%s/dist" % dir["web"],
            "APACHE_LOGGING_PATH": "/dev/null",
        },
        "commands": [
            "mkdir -p %s/dist" % dir["web"],
            "/usr/local/bin/apachectl -D FOREGROUND",
        ],
    }]

def setUpOauth2(forIntegrationApp):
    oidcURL = ""

    if (forIntegrationApp):
        oidcURL = "http://owncloud/index.php/apps/web/oidc-callback.html"
    else:
        oidcURL = "http://web/oidc-callback.html"

    return [{
        "name": "setup-oauth2",
        "image": OC_CI_PHP,
        "commands": [
            "bash -x tests/drone/setup-oauth2.sh {} {}".format(dir["server"], oidcURL),
        ],
    }]

def setupGraphapiOIdC():
    return [{
        "name": "setup-graphapi",
        "image": OC_CI_PHP,
        "commands": [
            "bash -x tests/drone/setup-graph-api-oidc.sh {}".format(dir["server"]),
        ],
    }]

def buildGlauth():
    return [{
        "name": "build-glauth",
        "image": OC_CI_GOLANG,
        "commands": [
            "bash -x tests/drone/build-glauth.sh {}".format(dir["base"]),
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }, {
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def glauthService():
    return [{
        "name": "glauth",
        "image": OC_CI_GOLANG,
        "detach": True,
        "environment": {
            "GLAUTH_BACKEND_DATASTORE": "owncloud",
            "GLAUTH_BACKEND_BASEDN": "dc=example,dc=com",
        },
        "commands": [
            "cd %s" % dir["base"],
            "./glauth --log-level debug server --backend-server http://owncloud/",
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }, {
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def buildIdP():
    return [{
        "name": "build-idp",
        "image": OC_CI_GOLANG,
        "commands": [
            "bash -x tests/drone/build-idp.sh {}".format(dir["base"]),
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }, {
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def idpService():
    return [{
        "name": "idp",
        "image": OC_CI_GOLANG,
        "detach": True,
        "environment": {
            "LDAP_BASEDN": "dc=example,dc=com",
            "LDAP_BINDDN": "cn=admin,ou=users,dc=example,dc=com",
            "LDAP_URI": "ldap://glauth:9125",
            "IDP_IDENTIFIER_REGISTRATION_CONF": "/srv/config/drone/identifier-registration-oc10.yml",
            "IDP_ISS": "https://idp:9130",
            "LDAP_BINDPW": "admin",
            "LDAP_SCOPE": "sub",
            "LDAP_LOGIN_ATTRIBUTE": "uid",
            "LDAP_EMAIL_ATTRIBUTE": "mail",
            "LDAP_NAME_ATTRIBUTE": "givenName",
            "LDAP_UUID_ATTRIBUTE": "uid",
            "LDAP_UUID_ATTRIBUTE_TYPE": "text",
            "LDAP_FILTER": "(objectClass=posixaccount)",
        },
        "commands": [
            "cd %s" % dir["base"],
            "./idp  --log-level debug server --signing-kid gen1-2020-02-27",
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }, {
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def ocisService():
    return [{
        "name": "ocis",
        "image": OC_CI_GOLANG,
        "detach": True,
        "environment": {
            "OCIS_URL": "https://ocis:9200",
            "STORAGE_HOME_DRIVER": "ocis",
            "STORAGE_USERS_DRIVER": "ocis",
            "STORAGE_USERS_DRIVER_LOCAL_ROOT": "/srv/app/tmp/ocis/local/root",
            "STORAGE_USERS_DRIVER_OWNCLOUD_DATADIR": "/srv/app/tmp/ocis/owncloud/data",
            "STORAGE_USERS_DRIVER_OCIS_ROOT": "/srv/app/tmp/ocis/storage/users",
            "STORAGE_METADATA_DRIVER_OCIS_ROOT": "/srv/app/tmp/ocis/storage/metadata",
            "STORAGE_SHARING_USER_JSON_FILE": "/srv/app/tmp/ocis/shares.json",
            "PROXY_OIDC_INSECURE": "true",
            "WEB_UI_CONFIG": "/srv/config/drone/config-ocis.json",
            "WEB_ASSET_PATH": "%s/dist" % dir["web"],
            "IDP_IDENTIFIER_REGISTRATION_CONF": "/srv/config/drone/identifier-registration.yml",
            "ACCOUNTS_DATA_PATH": "/srv/app/tmp/ocis-accounts/",
            "PROXY_ENABLE_BASIC_AUTH": True,
            "OCIS_LOG_LEVEL": "error",
        },
        "commands": [
            "cd %s/ocis-build" % dir["base"],
            "mkdir -p /srv/app/tmp/ocis/owncloud/data/",
            "mkdir -p /srv/app/tmp/ocis/storage/users/",
            "./ocis server",
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }, {
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def buildOcisWeb():
    return [{
        "name": "build-ocis-web",
        "image": OC_CI_GOLANG,
        "commands": [
            "bash -x tests/drone/build-ocis-web.sh {}".format(dir["base"]),
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }, {
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

# Ocis-web service just for the oc10 tests
def ocisWebService():
    return [{
        "name": "web",
        "image": OC_CI_GOLANG,
        "detach": True,
        "environment": {
            "WEB_UI_CONFIG": "/srv/config/drone/config-oc10-openid.json",
            "WEB_ASSET_PATH": "%s/dist" % dir["web"],
        },
        "commands": [
            "cd %s" % dir["base"],
            "./ocis-web --log-level debug server",
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }, {
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def setupServerConfigureWeb(logLevel):
    return [{
        "name": "setup-server-configure-web",
        "image": OC_CI_PHP,
        "commands": [
            "if test -f runUnitTestsOnly || test -f runTestsForDocsChangeOnly; then echo 'skipping configureWeb'; else bash -x tests/drone/configure-web.sh {}; fi".format(dir["web"]),
        ],
        "volumes": [{
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def setupNotificationsAppForServer():
    return [{
        "name": "install-notifications-app-on-server",
        "image": OC_CI_PHP,
        "commands": [
            "bash -x tests/drone/setup-notifications-app.sh {}".format(dir["server"]),
        ],
    }]

def setupServerAndAppsForIntegrationApp(logLevel):
    return [{
        "name": "setup-server-%s" % config["app"],
        "image": OC_CI_PHP,
        "commands": [
            "bash -x tests/drone/setup-server-and-app.sh %s %s %s" % (dir["server"], logLevel, "builtInWeb"),
        ],
    }]

def setupServerAndApp(logLevel):
    return [{
        "name": "setup-server-%s" % config["app"],
        "image": OC_CI_PHP,
        "commands": [
            "bash -x tests/drone/setup-server-and-app.sh %s %s" % (dir["server"], logLevel),
        ],
    }]

def setupFedServerAndApp(logLevel):
    return [{
        "name": "setup-fed-server-%s" % config["app"],
        "image": OC_CI_PHP,
        "commands": [
            "bash -x tests/drone/setup-fed-server-and-app.sh {} {}".format(dir["federated"], logLevel),
        ],
    }]

def fixPermissions():
    return [{
        "name": "fix-permissions",
        "image": OC_CI_PHP,
        "commands": [
            "cd %s && chown www-data * -R" % dir["server"],
        ],
    }]

def fixPermissionsFederated():
    return [{
        "name": "fix-permissions-federated",
        "image": OC_CI_PHP,
        "commands": [
            "cd %s && chown www-data * -R" % dir["federated"],
        ],
    }]

def owncloudLog():
    return [{
        "name": "owncloud-log",
        "image": "owncloud/ubuntu:20.04",
        "detach": True,
        "commands": [
            "tail -f %s/data/owncloud.log" % dir["server"],
        ],
    }]

def owncloudLogFederated():
    return [{
        "name": "owncloud-federated-log",
        "image": "owncloud/ubuntu:20.04",
        "detach": True,
        "commands": [
            "tail -f %s/data/owncloud.log" % dir["federated"],
        ],
    }]

def copyFilesForUpload():
    return [{
        "name": "copy-files-for-upload",
        "image": OC_CI_PHP,
        "volumes": [{
            "name": "uploads",
            "path": "/filesForUpload",
        }],
        "commands": [
            "bash -x tests/drone/copy-files-for-upload.sh {}".format(dir["web"]),
        ],
    }]

def runWebuiAcceptanceTests(ctx, suite, alternateSuiteName, filterTags, extraEnvironment, browser, visualTesting, screenShots):
    environment = {}
    if (filterTags != ""):
        environment["TEST_TAGS"] = filterTags
    if isLocalBrowser(browser):
        environment["LOCAL_UPLOAD_DIR"] = "/uploads"
        if type(suite) == "list":
            paths = ""
            for path in suite:
                paths = paths + "features/" + path + " "
            environment["TEST_PATHS"] = paths
        elif (suite != "all"):
            environment["TEST_CONTEXT"] = suite
    else:
        environment["TEST_CONTEXT"] = suite
        environment["BROWSER_NAME"] = getSaucelabsBrowserName(browser)
        environment["SELENIUM_PORT"] = "4445"
        environment["SAUCELABS_TUNNEL_NAME"] = getSaucelabsTunnelName(alternateSuiteName, browser)
        environment["SAUCE_USERNAME"] = {
            "from_secret": "sauce_username",
        }
        environment["SAUCE_ACCESS_KEY"] = {
            "from_secret": "sauce_access_key",
        }

    if ctx.build.event == "cron":
        environment["RERUN_FAILED_WEBUI_SCENARIOS"] = "false"
    if (visualTesting):
        environment["VISUAL_TEST"] = "true"
    if (screenShots):
        environment["SCREENSHOTS"] = "true"
    environment["SERVER_HOST"] = "http://web"
    environment["BACKEND_HOST"] = "http://owncloud"
    environment["COMMENTS_FILE"] = "/var/www/owncloud/web/comments.file"

    for env in extraEnvironment:
        environment[env] = extraEnvironment[env]

    return [{
        "name": "webui-acceptance-tests",
        "image": OC_CI_NODEJS,
        "environment": environment,
        "commands": [
            "cd %s/tests/acceptance && ./run.sh" % dir["web"],
        ],
        "volumes": [{
            "name": "gopath",
            "path": "/srv/app",
        }, {
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def cacheOcisPipeline(ctx):
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "cache-ocis",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": skipIfUnchanged(ctx, "cache") +
                 buildOCISCache() +
                 cacheOcis() +
                 listRemoteCache(),
        "volumes": [{
            "name": "gopath",
            "temp": {},
        }],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def getOcis():
    return [{
        "name": "get-ocis-from-cache",
        "image": "minio/mc:RELEASE.2020-12-10T01-26-17Z",
        "failure": "ignore",
        "environment": {
            "MC_HOST": {
                "from_secret": "cache_s3_endpoint",
            },
            "AWS_ACCESS_KEY_ID": {
                "from_secret": "cache_s3_access_key",
            },
            "AWS_SECRET_ACCESS_KEY": {
                "from_secret": "cache_s3_secret_key",
            },
        },
        "commands": [
            "bash -x tests/drone/get-ocis.sh {} {}".format(dir["base"], dir["web"]),
        ],
    }]

def buildOCISCache():
    return [
        {
            "name": "generate-ocis",
            "image": OC_CI_NODEJS,
            "environment": {
                "GOPATH": "/go",
            },
            "commands": [
                "./tests/drone/build-ocis.sh nodejs",
            ],
            "volumes": [
                {
                    "name": "gopath",
                    "path": "/go",
                },
            ],
        },
        {
            "name": "build-ocis",
            "image": OC_CI_GOLANG,
            "commands": [
                "./tests/drone/build-ocis.sh golang",
            ],
            "volumes": [
                {
                    "name": "gopath",
                    "path": "/go",
                },
            ],
        },
    ]

def cacheOcis():
    return [{
        "name": "upload-ocis-bin",
        "image": "plugins/s3",
        "pull": "if-not-exists",
        "settings": {
            "bucket": "owncloud",
            "endpoint": {
                "from_secret": "cache_s3_endpoint",
            },
            "path_style": True,
            "source": "%s/ocis-build/**/*" % dir["base"],
            "strip_prefix": "%s/ocis-build" % dir["base"],
            "target": "/web/ocis-build/",
            "access_key": {
                "from_secret": "cache_s3_access_key",
            },
            "secret_key": {
                "from_secret": "cache_s3_secret_key",
            },
        },
    }]

def listRemoteCache():
    return [{
        "name": "list-ocis-bin-cache",
        "image": "minio/mc:RELEASE.2020-12-10T01-26-17Z",
        "failure": "ignore",
        "environment": {
            "MC_HOST": {
                "from_secret": "cache_s3_endpoint",
            },
            "AWS_ACCESS_KEY_ID": {
                "from_secret": "cache_s3_access_key",
            },
            "AWS_SECRET_ACCESS_KEY": {
                "from_secret": "cache_s3_secret_key",
            },
        },
        "commands": [
            "mc alias set s3 $MC_HOST $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY && mc find s3/owncloud/web/ocis-build",
        ],
    }]

def stopBuild():
    return [{
        "name": "stop-build",
        "image": "drone/cli:alpine",
        "environment": {
            "DRONE_SERVER": "https://drone.owncloud.com",
            "DRONE_TOKEN": {
                "from_secret": "drone_token",
            },
        },
        "commands": [
            "drone build stop owncloud/web ${DRONE_BUILD_NUMBER}",
        ],
        "when": {
            "status": [
                "failure",
            ],
            "event": [
                "pull_request",
            ],
        },
    }]

def uploadScreenshots():
    return [{
        "name": "upload-screenshots",
        "image": "plugins/s3",
        "pull": "if-not-exists",
        "settings": {
            "bucket": "owncloud",
            "endpoint": {
                "from_secret": "cache_s3_endpoint",
            },
            "path_style": True,
            "source": "%s/tests/reports/screenshots/**/*" % dir["web"],
            "strip_prefix": "%s/tests/reports/screenshots" % dir["web"],
            "target": "/web/screenshots/${DRONE_BUILD_NUMBER}",
        },
        "environment": {
            "AWS_ACCESS_KEY_ID": {
                "from_secret": "cache_s3_access_key",
            },
            "AWS_SECRET_ACCESS_KEY": {
                "from_secret": "cache_s3_secret_key",
            },
        },
        "when": {
            "status": [
                "failure",
            ],
            "event": [
                "pull_request",
            ],
        },
    }]

def listScreenShots():
    return [{
        "name": "list screenshots-visual",
        "image": OC_CI_NODEJS,
        "commands": [
            "ls -laR %s/tests/vrt" % dir["web"],
        ],
        "when": {
            "status": [
                "failure",
            ],
        },
    }]

def uploadVisualDiff():
    return [{
        "name": "upload-diff-screenshots",
        "image": "plugins/s3",
        "pull": "if-not-exists",
        "settings": {
            "bucket": "owncloud",
            "endpoint": {
                "from_secret": "cache_s3_endpoint",
            },
            "path_style": True,
            "source": "%s/tests/vrt/diff/**/*" % dir["web"],
            "strip_prefix": "%s/tests/vrt" % dir["web"],
            "target": "/web/screenshots/${DRONE_BUILD_NUMBER}",
        },
        "environment": {
            "AWS_ACCESS_KEY_ID": {
                "from_secret": "cache_s3_access_key",
            },
            "AWS_SECRET_ACCESS_KEY": {
                "from_secret": "cache_s3_secret_key",
            },
        },
        "when": {
            "status": [
                "failure",
            ],
            "event": [
                "pull_request",
            ],
        },
    }]

def uploadVisualScreenShots():
    return [{
        "name": "upload-latest-screenshots",
        "image": "plugins/s3",
        "pull": "if-not-exists",
        "settings": {
            "bucket": "owncloud",
            "endpoint": {
                "from_secret": "cache_s3_endpoint",
            },
            "path_style": True,
            "source": "%s/tests/vrt/latest/**/*" % dir["web"],
            "strip_prefix": "%s/tests/vrt" % dir["web"],
            "target": "/web/screenshots/${DRONE_BUILD_NUMBER}",
        },
        "environment": {
            "AWS_ACCESS_KEY_ID": {
                "from_secret": "cache_s3_access_key",
            },
            "AWS_SECRET_ACCESS_KEY": {
                "from_secret": "cache_s3_secret_key",
            },
        },
        "when": {
            "status": [
                "failure",
            ],
            "event": [
                "pull_request",
            ],
        },
    }]

def buildGithubCommentVisualDiff(ctx, suite, runningOnOCIS):
    backend = "ocis" if runningOnOCIS else "oc10"
    branch = ctx.build.source if ctx.build.event == "pull_request" else "master"
    return [{
        "name": "build-github-comment-vrt",
        "image": "owncloud/ubuntu:20.04",
        "commands": [
            "cd %s/tests/vrt" % dir["web"],
            "if [ ! -d diff ]; then exit 0; fi",
            "cd diff",
            "if [ ! -d %s ]; then exit 0; fi" % backend,
            "cd %s" % backend,
            "ls -la",
            'echo "<details><summary>:boom: Visual regression tests failed. Please find the screenshots inside ...</summary>\\n\\n<p>\\n\\n" >> %s/comments.file' % dir["web"],
            'echo "Diff Image: </br>" >> %s/comments.file' % dir["web"],
            'for f in *.png; do echo \'!\'"[$f]($CACHE_ENDPOINT/owncloud/web/screenshots/${DRONE_BUILD_NUMBER}/diff/%s/$f)" >> %s/comments.file; done' % (backend, dir["web"]),
            "cd ../../latest",
            "cd %s" % backend,
            'echo "Actual Image: </br>" >> %s/comments.file' % dir["web"],
            'for f in *.png; do echo \'!\'"[$f]($CACHE_ENDPOINT/owncloud/web/screenshots/${DRONE_BUILD_NUMBER}/latest/%s/$f)" >> %s/comments.file; done' % (backend, dir["web"]),
            'echo "Comparing Against: </br>" >> %s/comments.file' % dir["web"],
            'for f in *.png; do echo \'!\'"[$f](https://raw.githubusercontent.com/owncloud/web/%s/tests/vrt/baseline/%s/$f)" >> %s/comments.file; done' % (branch, backend, dir["web"]),
            'echo "\n</p></details>" >> %s/comments.file' % dir["web"],
            "more %s/comments.file" % dir["web"],
        ],
        "environment": {
            "TEST_CONTEXT": suite,
            "CACHE_ENDPOINT": {
                "from_secret": "cache_s3_endpoint",
            },
        },
        "when": {
            "status": [
                "failure",
            ],
            "event": [
                "pull_request",
            ],
        },
    }]

def buildGithubComment(suite):
    return [{
        "name": "build-github-comment",
        "image": "owncloud/ubuntu:20.04",
        "commands": [
            "cd %s/tests/reports/screenshots/" % dir["web"],
            'echo "<details><summary>:boom: The acceptance tests failed. Please find the screenshots inside ...</summary>\\n\\n<p>\\n\\n" >> %s/comments.file' % dir["web"],
            'for f in *.png; do echo "### $f\n" \'!\'"[$f]($CACHE_ENDPOINT/owncloud/web/screenshots/${DRONE_BUILD_NUMBER}/$f) \n" >> %s/comments.file; done' % dir["web"],
            'echo "\n</p></details>" >> %s/comments.file' % dir["web"],
            "more %s/comments.file" % dir["web"],
        ],
        "environment": {
            "TEST_CONTEXT": suite,
            "CACHE_ENDPOINT": {
                "from_secret": "cache_s3_endpoint",
            },
        },
        "when": {
            "status": [
                "failure",
            ],
            "event": [
                "pull_request",
            ],
        },
    }]

def buildGithubCommentForBuildStopped(suite):
    return [{
        "name": "build-github-comment-buildStop",
        "image": "owncloud/ubuntu:20.04",
        "commands": [
            'echo ":boom: The acceptance tests pipeline failed. The build has been cancelled.\\n" >> %s/comments.file' % dir["web"],
        ],
        "when": {
            "status": [
                "failure",
            ],
            "event": [
                "pull_request",
            ],
        },
    }]

def githubComment(alternateSuiteName):
    prefix = "Results for <strong>%s</strong> ${DRONE_BUILD_LINK}/${DRONE_JOB_NUMBER}${DRONE_STAGE_NUMBER}/1" % alternateSuiteName
    return [{
        "name": "github-comment",
        "image": "jmccann/drone-github-comment:1",
        "pull": "if-not-exists",
        "settings": {
            "message_file": "%s/comments.file" % dir["web"],
        },
        "environment": {
            "GITHUB_TOKEN": {
                "from_secret": "github_token",
            },
        },
        "commands": [
            "if [ -s /var/www/owncloud/web/comments.file ]; then echo '%s' | cat - comments.file > temp && mv temp comments.file && /bin/drone-github-comment; fi" % prefix,
        ],
        "when": {
            "status": [
                "success",
                "failure",
            ],
            "event": [
                "pull_request",
            ],
        },
    }]

def example_deploys(ctx):
    latest_configs = [
        "ocis_web/latest.yml",
    ]
    released_configs = []

    # if on master branch:
    configs = latest_configs
    rebuild = "false"

    if ctx.build.event == "tag":
        configs = released_configs
        rebuild = "false"

    if ctx.build.event == "cron":
        configs = latest_configs + released_configs
        rebuild = "true"

    deploys = []
    for config in configs:
        deploys.append(deploy(ctx, config, rebuild))

    return deploys

def deploy(ctx, config, rebuild):
    return {
        "kind": "pipeline",
        "type": "docker",
        "name": "deploy_%s" % (config),
        "platform": {
            "os": "linux",
            "arch": "amd64",
        },
        "steps": [
            {
                "name": "clone continuous deployment playbook",
                "image": "alpine/git:latest",
                "commands": [
                    "cd deployments/continuous-deployment-config",
                    "git clone https://github.com/owncloud-devops/continuous-deployment.git",
                ],
            },
            {
                "name": "deploy",
                "image": "owncloudci/drone-ansible:latest",
                "failure": "ignore",
                "environment": {
                    "CONTINUOUS_DEPLOY_SERVERS_CONFIG": "../%s" % (config),
                    "REBUILD": "%s" % (rebuild),
                    "HCLOUD_API_TOKEN": {
                        "from_secret": "hcloud_api_token",
                    },
                    "CLOUDFLARE_API_TOKEN": {
                        "from_secret": "cloudflare_api_token",
                    },
                },
                "settings": {
                    "playbook": "deployments/continuous-deployment-config/continuous-deployment/playbook-all.yml",
                    "galaxy": "deployments/continuous-deployment-config/continuous-deployment/requirements.yml",
                    "requirements": "deployments/continuous-deployment-config/continuous-deployment/py-requirements.txt",
                    "inventory": "localhost",
                    "private_key": {
                        "from_secret": "ssh_private_key",
                    },
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/tags/v*",
            ],
        },
    }

def checkStarlark():
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "check-starlark",
        "steps": [
            {
                "name": "format-check-starlark",
                "image": "owncloudci/bazel-buildifier",
                "commands": [
                    "buildifier --mode=check .drone.star",
                ],
            },
            {
                "name": "show-diff",
                "image": "owncloudci/bazel-buildifier",
                "commands": [
                    "buildifier --mode=fix .drone.star",
                    "git diff",
                ],
                "when": {
                    "status": [
                        "failure",
                    ],
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/pull/**",
            ],
        },
    }]

def pipelineDependsOn(pipeline, dependant_pipelines):
    if "depends_on" in pipeline.keys():
        pipeline["depends_on"] = pipeline["depends_on"] + getPipelineNames(dependant_pipelines)
    else:
        pipeline["depends_on"] = getPipelineNames(dependant_pipelines)
    return pipeline

def pipelinesDependsOn(pipelines, dependant_pipelines):
    pipes = []
    for pipeline in pipelines:
        pipes.append(pipelineDependsOn(pipeline, dependant_pipelines))

    return pipes

def getPipelineNames(pipelines = []):
    """getPipelineNames returns names of pipelines as a string array

    Args:
      pipelines: array of drone pipelines

    Returns:
      names of the given pipelines as string array
    """
    names = []
    for pipeline in pipelines:
        names.append(pipeline["name"])
    return names

def skipIfUnchanged(ctx, type):
    if ("full-ci" in ctx.build.title.lower()):
        return []

    skip_step = {
        "name": "skip-if-unchanged",
        "image": "owncloudci/drone-skip-pipeline",
        "when": {
            "event": [
                "pull_request",
            ],
        },
    }

    base_skip_steps = [
        "^.github/.*",
        "^changelog/.*",
        "^config/.*",
        "^deployments/.*",
        "^dev/.*",
        "^docs/.*",
        "^packages/web-app-skeleton/.*",
        "^tests/smoke/.*",
        "README.md",
    ]

    if type == "cache" or type == "lint":
        skip_step["settings"] = {
            "ALLOW_SKIP_CHANGED": base_skip_steps,
        }
        return [skip_step]

    if type == "acceptance-tests":
        acceptance_skip_steps = [
            "^__fixtures__/.*",
            "^__mocks__/.*",
            "^packages/.*/tests/.*",
            "^tests/integration/.*",
            "^tests/unit/.*",
        ]
        skip_step["settings"] = {
            "ALLOW_SKIP_CHANGED": base_skip_steps + acceptance_skip_steps,
        }
        return [skip_step]

    if type == "unit-tests":
        unit_skip_steps = [
            "^tests/acceptance/.*",
        ]
        skip_step["settings"] = {
            "ALLOW_SKIP_CHANGED": base_skip_steps + unit_skip_steps,
        }
        return [skip_step]

    return []

def genericCache(name, action, mounts, cache_key):
    rebuild = "false"
    restore = "false"
    if action == "rebuild":
        rebuild = "true"
        action = "rebuild"
    else:
        restore = "true"
        action = "restore"

    step = {
        "name": "%s_%s" % (action, name),
        "image": "meltwater/drone-cache:v1",
        "environment": {
            "AWS_ACCESS_KEY_ID": {
                "from_secret": "cache_s3_access_key",
            },
            "AWS_SECRET_ACCESS_KEY": {
                "from_secret": "cache_s3_secret_key",
            },
        },
        "settings": {
            "endpoint": {
                "from_secret": "cache_s3_endpoint",
            },
            "bucket": "cache",
            "region": "us-east-1",  # not used at all, but fails if not given!
            "path_style": "true",
            "cache_key": cache_key,
            "rebuild": rebuild,
            "restore": restore,
            "mount": mounts,
        },
    }
    return step

def genericCachePurge(ctx, name, cache_key):
    return {
        "kind": "pipeline",
        "type": "docker",
        "name": "purge_%s" % (name),
        "platform": {
            "os": "linux",
            "arch": "amd64",
        },
        "steps": [
            {
                "name": "purge-cache",
                "image": "minio/mc:RELEASE.2021-03-23T05-46-11Z",
                "failure": "ignore",
                "environment": {
                    "MC_HOST_cache": {
                        "from_secret": "cache_s3_connection_url",
                    },
                },
                "commands": [
                    "mc rm --recursive --force cache/cache/%s/%s" % (ctx.repo.name, cache_key),
                ],
            },
        ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/tags/v*",
                "refs/pull/**",
            ],
            "status": [
                "success",
                "failure",
            ],
        },
    }

def listDir(path):
    return {
        "name": "list-dir %s" % (path),
        "image": OC_CI_ALPINE,
        "commands": [
            "tree %s" % (path),
        ],
    }

def genericBuildArtifactCache(ctx, name, action, path):
    name = "%s_build_artifact_cache" % (name)
    cache_key = "%s/%s/%s" % (ctx.repo.slug, ctx.build.commit + "-${DRONE_BUILD_NUMBER}", name)
    if action == "rebuild" or action == "restore":
        return genericCache(name, action, [path], cache_key)
    if action == "purge":
        return genericCachePurge(ctx, name, cache_key)
    return []

def restoreBuildArtifactCache(ctx, name, path):
    return [genericBuildArtifactCache(ctx, name, "restore", path), listDir(path)]

def rebuildBuildArtifactCache(ctx, name, path):
    return [genericBuildArtifactCache(ctx, name, "rebuild", path)]

def purgeBuildArtifactCache(ctx, name):
    return genericBuildArtifactCache(ctx, name, "purge", [])

def pipelineSanityChecks(ctx, pipelines):
    """pipelineSanityChecks helps the CI developers to find errors before running it

    These sanity checks are only executed on when converting starlark to yaml.
    Error outputs are only visible when the conversion is done with the drone cli.

    Args:
      ctx: drone passes a context with information which the pipeline can be adapted to
      pipelines: pipelines to be checked, normally you should run this on the return value of main()

    Returns:
      none
    """

    # check if name length of pipeline and steps are exceeded.
    max_name_length = 50
    for pipeline in pipelines:
        pipeline_name = pipeline["name"]
        if len(pipeline_name) > max_name_length:
            print("Error: pipeline name %s is longer than 50 characters" % (pipeline_name))

        for step in pipeline["steps"]:
            step_name = step["name"]
            if len(step_name) > max_name_length:
                print("Error: step name %s in pipeline %s is longer than 50 characters" % (step_name, pipeline_name))

    # check for non existing depends_on
    possible_depends = []
    for pipeline in pipelines:
        possible_depends.append(pipeline["name"])

    for pipeline in pipelines:
        if "depends_on" in pipeline.keys():
            for depends in pipeline["depends_on"]:
                if not depends in possible_depends:
                    print("Error: depends_on %s for pipeline %s is not defined" % (depends, pipeline["name"]))

    # check for non declared volumes
    for pipeline in pipelines:
        pipeline_volumes = []
        if "volumes" in pipeline.keys():
            for volume in pipeline["volumes"]:
                pipeline_volumes.append(volume["name"])

        for step in pipeline["steps"]:
            if "volumes" in step.keys():
                for volume in step["volumes"]:
                    if not volume["name"] in pipeline_volumes:
                        print("Warning: volume %s for step %s is not defined in pipeline %s" % (volume["name"], step["name"], pipeline["name"]))

    # list used docker images
    print("")
    print("List of used docker images:")

    images = {}

    for pipeline in pipelines:
        for step in pipeline["steps"]:
            image = step["image"]
            if image in images.keys():
                images[image] = images[image] + 1
            else:
                images[image] = 1

    for image in images.keys():
        print(" %sx\t%s" % (images[image], image))
