config = {
    "app": "web",
    "rocketchat": {
        "channel": "builds",
        "from_secret": "private_rocketchat",
    },
    "branches": [
        "master",
        "release*",
        "develop*",
    ],
    "yarnlint": True,
    "acceptance": {
        "webUI": {
            "suites": {
                "webUIBasic": [
                    "webUIAccount",
                    "webUILogin",
                    "webUIPreview",
                    "webUIPrivateLinks",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                    "webUIAdminSettings",
                    "webUIComments",
                    "webUITags",
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "webUICreate": [
                    "webUICreateFilesFolders",
                ],
                "webUIDelete": [
                    "webUIDeleteFilesFolders",
                ],
                "webUIRename": [
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                ],
                "webUISharingBasic": [
                    "webUISharingAcceptShares",
                    "webUISharingAcceptSharesToRoot",
                ],
                "webUIFavorites": "Favorites",
                "webUIMarkdownEditor": "MarkdownEditor",
                "webUIFiles1": [
                    "webUIFiles",
                    "webUIFilesActionMenu",
                    "webUIFilesCopy",
                ],
                "webUIFiles2": [
                    "webUIFilesDetails",
                    "webUIFilesList",
                    "webUIFilesSearch",
                ],
                "webUIMoveFilesFolders": "Move",
                "webUIResharing": [
                    "webUIResharing1",
                    "webUIResharing2",
                ],
                "webUIResharingToRoot": "ResharingToRoot",
                "webUIRestrictSharing": "RestrictSharing",
                "webUISharingAutocompletion": "SharingAutocompletion",
                "webUISharingFilePermissionMultipleUsers": "SharingFilePermissionMultipleUsers",
                "webUISharingFilePermissionsGroups": "SharingFilePermissionsGroups",
                "webUISharingFolderAdvancedPermissionMultipleUsers": "SharingFolderAdvancedPermissionMU",
                "webUISharingFolderAdvancedPermissionsGroups": "SharingFolderAdvPermissionsGrp",
                "webUISharingFolderPermissionMultipleUsers": "SharingFolderPermissionMultipleUsers",
                "webUISharingFolderPermissionsGroups": "SharingFolderPermissionsGroups",
                "webUISharingInternalGroups": "SharingInternalGroups",
                "webUISharingInternalGroupsEdgeCases": "SharingInternalGroupsEdgeCases",
                "webUISharingInternalGroupsSharingIndicator": "SharingInternalGroupsSharingIndicator",
                "webUISharingInternalGroupsToRoot": "SharingInternalGroupsRoot",
                "webUISharingInternalGroupsToRootEdgeCases": "SharingInternalGroupsRootEdgeCases",
                "webUISharingInternalGroupsToRootSharingIndicator": "SharingInternalGroupsRootSharingIndicator",
                "webUISharingInternalUsers": [
                    "webUISharingInternalUsers",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                ],
                "webUISharingInternalUsersBlacklisted": "SharingInternalUsersBlacklisted",
                "webUISharingInternalUsersExpire": "SharingInternalUsersExpire",
                "webUISharingInternalUsersExpireToRoot": "SharingInternalUsersExpireToRoot",
                "webUISharingInternalUsersSharingIndicator": "SharingInternalUsersSharingIndicator",
                "webUISharingInternalUsersToRoot": "webUISharingInternalUsersRoot1",
                "webUISharingInternalUsersRoot2": [
                    "webUISharingInternalUsersToRootCollaborator",
                    "webUISharingInternalUsersToRootPreviews",
                    "webUISharingInternalUsersToRootShareWithPage",
                ],
                "webUISharingInternalUsersToRootBlacklisted": "SharingInternalUsersRootBlacklisted",
                "webUISharingInternalUsersToRootSharingIndicator": "SharingInternalUsersRootSharingIndicator",
                "webUISharingPermissionsUsers": "SharingPermissionsUsers",
                "webUISharingPermissionToRoot": "SharingPermissionToRoot",
                "webUISharingPublicBasic": "SharingPublicBasic",
                "webUISharingPublicManagement": "SharingPublicManagement",
                "webUISharingPublicDifferentRoles": "SharingPublicDifferentRoles",
                "webUISharingPublicExpire": "SharingPublicExpire",
                "webUITrashbinDelete": "TrashbinDelete",
                "webUITrashbinFilesFolders": "TrashbinFilesFolders",
                "webUITrashbinRestore": "TrashbinRestore",
                "webUIUpload": "Upload",
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-with-oc10-server-oauth2-login.md",
                "WEB_UI_CONFIG": "/var/www/owncloud/web/dist/config.json",
            },
            "visualTesting": True,
            "screenShots": True,
        },
        "webUINotification": {
            "suites": {
                "webUINotificationBasic": [
                    "webUINotifications",
                ],
                "webUISharingNotifications": [
                    "webUISharingNotifications",
                    "webUISharingNotificationsToRoot",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-with-oc10-server-oauth2-login.md",
                "WEB_UI_CONFIG": "/var/www/owncloud/web/dist/config.json",
            },
            "visualTesting": True,
            "screenShots": True,
            "notificationsAppNeeded": True,
        },
        "webUIFederation": {
            "suites": {
                "webUISharingExternal": "SharingExternal",
                "webUISharingExternalToRoot": "SharingExternalRoot",
            },
            "extraEnvironment": {
                "REMOTE_BACKEND_HOST": "http://federated",
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-with-oc10-server-oauth2-login.md",
            },
            "notificationsAppNeeded": True,
            "federatedServerNeeded": True,
            "federatedServerVersion": "daily-master-qa",
        },
        "webUI-XGA-Notifications": {
            "suites": {
                "XGAPortrait1-Notifications": [
                    "webUINotifications",
                    "webUISharingNotifications",
                    "webUISharingNotificationsToRoot",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-XGA-with-oc10-server-oauth2-login.md",
                "SCREEN_RESOLUTION": "768x1024",
            },
            "notificationsAppNeeded": True,
            "filterTags": "@smokeTest and not @skipOnXGAPortraitResolution and not @skip and not @skipOnOC10",
        },
        "webUI-XGA": {
            "suites": {
                "XGAPortrait1": [
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
                    "webUIPreview",
                    "webUIPrivateLinks",
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                    "webUIRestrictSharing",
                    "webUISharingAcceptShares",
                    "webUISharingAcceptSharesToRoot",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                    "webUIAdminSettings",
                    "webUIComments",
                    "webUITags",
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "XGAPortrait2": [
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
                    "webUISharingInternalUsersExpire",
                    "webUISharingInternalUsersExpireToRoot",
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
                "SCREEN_RESOLUTION": "768x1024",
            },
            "filterTags": "@smokeTest and not @skipOnXGAPortraitResolution and not @skip and not @skipOnOC10",
        },
        "webUI-Notifications-iPhone": {
            "suites": {
                "iPhone1-Notifications": [
                    "webUINotifications",
                    "webUISharingNotifications",
                    "webUISharingNotificationsToRoot",
                ],
            },
            "extraEnvironment": {
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-Iphone-oc10-server-oauth2-login.md",
                "SCREEN_RESOLUTION": "375x812",
            },
            "notificationsAppNeeded": True,
            "filterTags": "@smokeTest and not @skipOnIphoneResolution and not @skip and not @skipOnOC10",
        },
        "webUI-iPhone": {
            "suites": {
                "iPhone1": [
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
                    "webUIPreview",
                    "webUIPrivateLinks",
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                    "webUIRestrictSharing",
                    "webUISharingAcceptShares",
                    "webUISharingAcceptSharesToRoot",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                    "webUIAdminSettings",
                    "webUIComments",
                    "webUITags",
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "iPhone2": [
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
                    "webUISharingInternalUsersExpire",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                    "webUISharingInternalUsersSharingIndicator",
                    "webUISharingInternalUsersToRootCollaborator",
                    "webUISharingInternalUsersToRootPreviews",
                    "webUISharingInternalUsersToRootShareWithPage",
                    "webUISharingInternalUsersToRootSharingIndicator",
                    "webUISharingInternalUsersExpireToRoot",
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
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-Iphone-oc10-server-oauth2-login.md",
                "SCREEN_RESOLUTION": "375x812",
            },
            "filterTags": "@smokeTest and not @skipOnIphoneResolution and not @skip and not @skipOnOC10",
        },
        "webUI-ocis": {
            "suites": {
                "webUIOCISBasic": [
                    "webUILogin",
                    "webUINotifications",
                    "webUIPrivateLinks",
                    "webUIPreview",
                    "webUIAccount",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                    "webUIAdminSettings",
                    "webUIComments",
                    "webUITags",
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "webUIOCISCreate": [
                    "webUICreateFilesFolders",
                ],
                "webUIOCISDelete": [
                    "webUIDeleteFilesFolders",
                ],
                "webUIOCISRename": [
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                ],
                "webUIOCISSharingBasic": [
                    "webUISharingAcceptShares",
                ],
                "webUIOCISRestrictSharing": [
                    "webUIRestrictSharing",
                ],
                "webUIOCISSharingNotifications": [
                    "webUISharingNotifications",
                ],
                "webUIFavorites": "OCISFavorites",
                "webUIMarkdownEditor": "OCISMarkdownEditor",
                "webUIOCISFiles1": [
                    "webUIFiles",
                    "webUIFilesActionMenu",
                    "webUIFilesCopy",
                ],
                "webUIOCISFiles2": [
                    "webUIFilesDetails",
                    "webUIFilesSearch",
                ],
                "webUIOCISFiles3": [
                    "webUIFilesList",
                ],
                "webUISharingAutocompletion": "OCISSharingAutocompletion",
                "OCISSharingInternalGroups": [
                    "webUISharingInternalGroups",
                    "webUISharingInternalGroupsEdgeCases",
                    "webUISharingInternalGroupsSharingIndicator",
                ],
                "OCISSharingInternalUsers1": [
                    "webUISharingInternalUsers",
                ],
                "OCISSharingInternalUsers2": [
                    "webUISharingInternalUsersBlacklisted",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                    "webUISharingInternalUsersSharingIndicator",
                ],
                "webUISharingInternalUsersExpire": "OCISSharingInternalUsersExpire",
                "webUISharingPermissionsUsers": "OCISSharingPermissionsUsers",
                "webUISharingFilePermissionsGroups": "OCISSharingFilePermissionsGroups",
                "webUISharingFolderPermissionsGroups": "OCISSharingFolderPermissionsGroups",
                "webUISharingFolderAdvancedPermissionsGroups": "OCISSharingFolderAdvPermissionsGrp",
                # for now run this suite by itself see https://github.com/owncloud/ocis/issues/736
                "OCISResharing1": [
                    "webUIResharing1",
                ],
                "OCISResharing2": [
                    "webUIResharing2",
                ],
                "webUISharingPublicBasic": "OCISSharingPublicBasic",
                "webUISharingPublicManagement": "OCISSharingPublicManagement",
                "webUISharingPublicExpire": "OCISSharingPublicExpire",
                "webUISharingPublicDifferentRoles": "OCISSharingPublicDifferentRoles",
                "webUITrashbinDelete": "OCISTrashbinDelete",
                "webUITrashbinFilesFolders": "OCISTrashbinFilesFolders",
                "webUITrashbinRestore": "OCISTrashbinRestore",
                "webUIUpload": "OCISUpload",
                "webUISharingFilePermissionMultipleUsers": "OCISSharingFilePermissionMultipleUsers",
                "webUISharingFolderPermissionMultipleUsers": "OCISSharingFolderPermissionMultipleUsers",
                "webUISharingFolderAdvancedPermissionMultipleUsers": "OCISSharingFolderAdvancedPermissionMU",
                "webUIMoveFilesFolders": "OCISMove",
                "webUIUserJourney": "OCISJourney",
            },
            "extraEnvironment": {
                "NODE_TLS_REJECT_UNAUTHORIZED": "0",
                "SERVER_HOST": "https://ocis:9200",
                "BACKEND_HOST": "https://ocis:9200",
                "RUN_ON_OCIS": "true",
                "TESTING_DATA_DIR": "/srv/app/testing/data/",
                "OCIS_REVA_DATA_ROOT": "/srv/app/tmp/ocis/owncloud/data/",
                "WEB_UI_CONFIG": "/srv/config/drone/ocis-config.json",
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-with-ocis-server-ocis-storage.md",
            },
            "runningOnOCIS": True,
            "visualTesting": True,
            "filterTags": "not @skip and not @skipOnOCIS and not @notToImplementOnOCIS",
        },
        "webUI-notifications-oc10-integration": {
            "suites": {
                "oc10-integration-notifications": [
                    "webUINotifications",
                    "webUISharingNotifications",
                    "webUISharingNotificationsToRoot",
                ],
            },
            "extraEnvironment": {
                "WEB_UI_CONFIG": "/srv/config/drone/config-oc10-integration-app-oauth.json",
                "SERVER_HOST": "http://owncloud/index.php/apps/web/index.html",
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-with-oc10-server-oauth2-login-and-web-integration-app.md",
            },
            "filterTags": "not @skip and not @skipOnOC10 and not @openIdLogin and @smokeTest",
            "oc10IntegrationAppIncluded": True,
            "notificationsAppNeeded": True,
            "screenShots": True,
        },
        "webUI-oc10-integration": {
            "suites": {
                "IntegrationApp1": [
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
                    "webUIPreview",
                    "webUIPrivateLinks",
                    "webUIRenameFiles",
                    "webUIRenameFolders",
                    "webUIRestrictSharing",
                    "webUISharingAcceptShares",
                    "webUISharingAcceptSharesToRoot",
                    # The following suites may have all scenarios currently skipped.
                    # The suites are listed here so that scenarios will run when
                    # they are enabled.
                    "webUIAdminSettings",
                    "webUIComments",
                    "webUITags",
                    "webUIWebdavLockProtection",
                    "webUIWebdavLocks",
                ],
                "IntegrationApp2": [
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
                    "webUISharingInternalUsersExpire",
                    "webUISharingInternalUsersCollaborator",
                    "webUISharingInternalUsersShareWithPage",
                    "webUISharingInternalUsersSharingIndicator",
                    "webUISharingInternalUsersToRootCollaborator",
                    "webUISharingInternalUsersToRootPreviews",
                    "webUISharingInternalUsersToRootShareWithPage",
                    "webUISharingInternalUsersToRootSharingIndicator",
                    "webUISharingInternalUsersExpireToRoot",
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
                "EXPECTED_FAILURES_FILE": "/var/www/owncloud/web/tests/acceptance/expected-failures-with-oc10-server-oauth2-login-and-web-integration-app.md",
            },
            "filterTags": "not @skip and not @skipOnOC10 and not @openIdLogin and @smokeTest",
            "oc10IntegrationAppIncluded": True,
            "screenShots": True,
        },
    },
    "build": True,
}

def main(ctx):
    before = beforePipelines(ctx)

    stages = stagePipelines(ctx)
    if (stages == False):
        print("Errors detected. Review messages above.")
        return []

    dependsOn(before, stages)

    after = afterPipelines(ctx)
    dependsOn(stages, after)

    return before + stages + after + checkStarlark()

def beforePipelines(ctx):
    return yarnlint() + changelog(ctx) + website(ctx)

def stagePipelines(ctx):
    acceptancePipelines = acceptance(ctx)
    if acceptancePipelines == False:
        return unitTests()

    cachePipelines = cacheOcisPipeline(ctx)
    return unitTests() + cachePipelines + acceptancePipelines

def afterPipelines(ctx):
    return build(ctx) + notify()

def yarnlint():
    pipelines = []

    if "yarnlint" not in config:
        return pipelines

    if type(config["yarnlint"]) == "bool":
        if not config["yarnlint"]:
            return pipelines

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "lint-test",
        "workspace": {
            "base": "/var/www/owncloud",
            "path": config["app"],
        },
        "steps": installNPM() +
                 lintTest(),
        "depends_on": [],
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
            "base": "/var/www/owncloud",
            "path": config["app"],
        },
        "steps": installNPM() +
                 buildRelease(ctx) +
                 buildDockerImage(),
        "depends_on": [],
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
                "pull": "always",
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
                "pull": "always",
                "commands": [
                    "calens >| CHANGELOG.md",
                ],
            },
            {
                "name": "diff",
                "image": "owncloud/alpine:latest",
                "pull": "always",
                "commands": [
                    "git diff",
                ],
            },
            {
                "name": "output",
                "image": "toolhippie/calens:latest",
                "pull": "always",
                "commands": [
                    "cat CHANGELOG.md",
                ],
            },
            {
                "name": "publish",
                "image": "plugins/git-action:1",
                "pull": "always",
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
        "depends_on": [],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/pull/**",
            ],
        },
    }

    pipelines.append(result)

    return pipelines

def unitTests():
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "unit-tests",
        "workspace": {
            "base": "/var/www/owncloud",
            "path": config["app"],
        },
        "steps": installNPM() +
                 buildWeb() +
                 [{
                     "name": "tests",
                     "image": "owncloudci/nodejs:12",
                     "pull": "always",
                     "commands": [
                         "yarn test:unit",
                     ],
                 }],
        "depends_on": [],
        "trigger": {
            "ref": [
                "refs/heads/master",
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
        "servers": [""],
        "browsers": ["chrome"],
        "databases": ["mysql:5.5"],
        "extraEnvironment": {},
        "cronOnly": False,
        "filterTags": "not @skip and not @skipOnOC10 and not @openIdLogin",
        "logLevel": "2",
        "notificationsAppNeeded": False,
        "federatedServerNeeded": False,
        "federatedServerVersion": "",
        "runningOnOCIS": False,
        "screenShots": False,
        "visualTesting": False,
        "openIdConnect": False,
        "oc10IntegrationAppIncluded": False,
        "skip": False,
        "debugSuites": [],
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
                        name = "%s%s" % (suiteName, browserString)
                        maxLength = 50
                        nameLength = len(name)
                        if nameLength > maxLength:
                            print("Error: generated stage name of length", nameLength, "is not supported. The maximum length is " + str(maxLength) + ".", name)
                            errorFound = True

                        # Basic steps and services for all testing
                        steps = installNPM()
                        if (params["oc10IntegrationAppIncluded"]):
                            steps += buildWebApp()
                        else:
                            steps += buildWeb()

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
                        steps += runWebuiAcceptanceTests(suite, alternateSuiteName, params["filterTags"], params["extraEnvironment"], browser, params["visualTesting"], params["screenShots"])

                        # capture the screenshots from visual regression testing (only runs on failure)
                        if (params["visualTesting"]):
                            steps += listScreenShots() + uploadVisualDiff() + uploadVisualScreenShots()
                            steps += buildGithubCommentVisualDiff(ctx, suiteName, alternateSuiteName, params["runningOnOCIS"])

                        # Capture the screenshots from acceptance tests (only runs on failure)
                        if (isLocalBrowser(browser) and params["screenShots"]):
                            steps += uploadScreenshots() + buildGithubComment(suiteName, alternateSuiteName)

                        # Upload the screenshots to github comment
                        if (params["visualTesting"] or (isLocalBrowser(browser) and params["screenShots"])):
                            steps += githubComment()

                        result = {
                            "kind": "pipeline",
                            "type": "docker",
                            "name": name,
                            "workspace": {
                                "base": "/var/www/owncloud",
                                "path": config["app"],
                            },
                            "steps": steps,
                            "services": services,
                            "depends_on": ["cache-ocis"] if (params["runningOnOCIS"]) else [],
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
                "pull": "always",
                "settings": {
                    "webhook": {
                        "from_secret": config["rocketchat"]["from_secret"],
                    },
                    "channel": config["rocketchat"]["channel"],
                },
            },
        ],
        "depends_on": [],
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
        "pull": "always",
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
            "pull": "always",
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
            "pull": "always",
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
            "pull": "always",
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
            "pull": "always",
            "volumes": [{
                "name": "uploads",
                "path": "/uploads",
            }],
        }]

    if browser == "firefox":
        return [{
            "name": "selenium",
            "image": "selenium/standalone-firefox-debug:3.141.59",
            "pull": "always",
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
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "environment": {
            "APACHE_WEBROOT": "/var/www/owncloud/server/",
        },
        "command": [
            "/usr/local/bin/apachectl",
            "-e",
            "debug",
            "-D",
            "FOREGROUND",
        ],
    }]

def owncloudFederatedService():
    return [{
        "name": "federated",
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "environment": {
            "APACHE_WEBROOT": "/var/www/owncloud/federated/",
        },
        "command": [
            "/usr/local/bin/apachectl",
            "-e",
            "debug",
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
        "image": "owncloudci/core",
        "pull": "always",
    }

    if version:
        stepDefinition.update({"settings": {
            "version": version,
            "core_path": "/var/www/owncloud/server",
            "db_type": dbType,
            "db_name": database,
            "db_host": host,
            "db_username": username,
            "db_password": password,
        }})
    else:
        stepDefinition.update({"settings": {
            "core_path": "/var/www/owncloud/server",
            "db_type": dbType,
            "db_name": database,
            "db_host": host,
            "db_username": username,
            "db_password": password,
        }})
        stepDefinition.update({"commands": [
            ". /var/www/owncloud/web/.drone.env",
            "export PLUGIN_GIT_REFERENCE=$CORE_COMMITID",
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
        "image": "owncloudci/core",
        "pull": "always",
    }
    if version:
        stepDefinition.update({"settings": {
            "version": version,
            "core_path": "/var/www/owncloud/federated/",
            "db_type": dbType,
            "db_name": database,
            "db_host": host + dbSuffix,
            "db_username": username,
            "db_password": password,
        }})
    else:
        stepDefinition.update({"settings": {
            "core_path": "/var/www/owncloud/federated/",
            "db_type": dbType,
            "db_name": database,
            "db_host": host + dbSuffix,
            "db_username": username,
            "db_password": password,
        }})
        stepDefinition.update({"commands": [
            ". /var/www/owncloud/web/.drone.env",
            "export PLUGIN_GIT_REFERENCE=$CORE_COMMITID",
            "bash /usr/sbin/plugin.sh",
        ]})

    return [stepDefinition]

def installNPM():
    return [{
        "name": "npm-install",
        "image": "owncloudci/nodejs:12",
        "pull": "always",
        "commands": [
            "yarn install --frozen-lockfile",
        ],
    }]

def lintTest():
    return [{
        "name": "lint-test",
        "image": "owncloudci/nodejs:12",
        "pull": "always",
        "commands": [
            "yarn run lint",
        ],
    }]

def buildWebApp():
    return [{
        "name": "build-web-integration-app",
        "image": "owncloudci/nodejs:12",
        "pull": "always",
        "commands": [
            "yarn build",
            "mkdir -p /srv/config",
            "cp -r /var/www/owncloud/web/tests/drone /srv/config",
            "ls -la /srv/config/drone",
        ],
        "volumes": [{
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def setupIntegrationWebApp():
    return [{
        "name": "setup-web-integration-app",
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "cd /var/www/owncloud/server",
            "mkdir apps-external/web",
            "cp /srv/config/drone/config-oc10-integration-app-oauth.json config/config.json",
            "cp /var/www/owncloud/web/packages/web-integration-oc10/* apps-external/web -r",
            "cp /var/www/owncloud/web/dist/* apps-external/web -r",
            "ls -la apps-external/web",
            "cat config/config.json",
        ],
        "volumes": [{
            "name": "configs",
            "path": "/srv/config",
        }],
    }]

def buildWeb():
    return [{
        "name": "build-web",
        "image": "owncloudci/nodejs:12",
        "pull": "always",
        "commands": [
            "yarn build",
            "cp tests/drone/config-oc10-oauth.json dist/config.json",
            "mkdir -p /srv/config",
            "cp -r /var/www/owncloud/web/tests/drone /srv/config",
            "ls -la /srv/config/drone",
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
        "pull": "always",
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
            "image": "owncloudci/nodejs:12",
            "pull": "always",
            "commands": [
                "cd /var/www/owncloud/web",
                "make -f Makefile.release",
            ],
        },
        {
            "name": "changelog",
            "image": "toolhippie/calens:latest",
            "pull": "always",
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
            "pull": "always",
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

def website(ctx):
    return [
        {
            "kind": "pipeline",
            "type": "docker",
            "name": "website",
            "platform": {
                "os": "linux",
                "arch": "amd64",
            },
            "steps": [
                {
                    "name": "prepare",
                    "image": "owncloudci/alpine:latest",
                    "commands": [
                        "\tmake docs-copy",
                    ],
                },
                {
                    "name": "test",
                    "image": "owncloudci/hugo:0.71.0",
                    "commands": [
                        "cd hugo",
                        "\thugo",
                    ],
                },
                {
                    "name": "list",
                    "image": "owncloudci/alpine:latest",
                    "commands": [
                        "tree hugo/public",
                    ],
                },
                {
                    "name": "publish",
                    "image": "plugins/gh-pages:1",
                    "pull": "always",
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
            "depends_on": [],
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
        "image": "owncloudci/php:7.4",
        "pull": "always",
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
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "environment": {
            "APACHE_WEBROOT": "/var/www/owncloud/web/dist",
        },
        "commands": [
            "mkdir dist",
            "/usr/local/bin/apachectl -e debug -D FOREGROUND",
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
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "git clone -b master https://github.com/owncloud/oauth2.git /var/www/owncloud/server/apps/oauth2",
            "cd /var/www/owncloud/server/apps/oauth2",
            "make vendor",
            "cd /var/www/owncloud/server/",
            "php occ a:e oauth2",
            "php occ oauth2:add-client Web Cxfj9F9ZZWQbQZps1E1M0BszMz6OOFq3lxjSuc8Uh4HLEYb9KIfyRMmgY5ibXXrU 930C6aA0U1VhM03IfNiheR2EwSzRi4hRSpcNqIhhbpeSGU6h38xssVfNcGP0sSwQ " + oidcURL,
        ],
    }]

def setupGraphapiOIdC():
    return [{
        "name": "setup-graphapi",
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "git clone -b master https://github.com/owncloud/graphapi.git /var/www/owncloud/server/apps/graphapi",
            "cd /var/www/owncloud/server/apps/graphapi",
            "make vendor",
            "git clone -b master https://github.com/owncloud/openidconnect.git /var/www/owncloud/server/apps/openidconnect",
            "cd /var/www/owncloud/server/apps/openidconnect",
            "make vendor",
            "cd /var/www/owncloud/server/",
            "php occ a:e graphapi",
            "php occ a:e openidconnect",
            "php occ config:system:set trusted_domains 2 --value=web",
            'php occ config:system:set openid-connect provider-url --value="https://idp:9130"',
            "php occ config:system:set openid-connect loginButtonName --value=OpenId-Connect",
            "php occ config:system:set openid-connect client-id --value=web",
            "php occ config:system:set openid-connect insecure --value=true --type=bool",
            'php occ config:system:set cors.allowed-domains 0 --value="http://web"',
            'php occ config:system:set memcache.local --value="\\\\OC\\\\Memcache\\\\APCu"',
            'php occ config:system:set web.baseUrl --value="http://web"',
            "php occ config:list",
        ],
    }]

def buildGlauth():
    return [{
        "name": "build-glauth",
        "image": "owncloudci/golang:1.16",
        "pull": "always",
        "commands": [
            "cd /srv/app/src/github.com/owncloud/ocis/glauth",
            "make build",
            "cp bin/glauth /var/www/owncloud",
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
        "image": "owncloudci/golang:1.16",
        "pull": "always",
        "detach": True,
        "environment": {
            "GLAUTH_BACKEND_DATASTORE": "owncloud",
            "GLAUTH_BACKEND_BASEDN": "dc=example,dc=com",
        },
        "commands": [
            "cd /var/www/owncloud",
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
        "image": "owncloudci/golang:1.16",
        "pull": "always",
        "commands": [
            "cd /srv/app/src/github.com/owncloud/ocis",
            "cd idp",
            "make build",
            "cp bin/idp /var/www/owncloud",
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
        "image": "owncloudci/golang:1.16",
        "pull": "always",
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
            "cd /var/www/owncloud",
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
        "image": "owncloudci/golang:1.16",
        "pull": "always",
        "detach": True,
        "environment": {
            "OCIS_URL": "https://ocis:9200",
            "STORAGE_HOME_DRIVER": "ocis",
            "STORAGE_USERS_DRIVER": "ocis",
            "STORAGE_DRIVER_OCIS_ROOT": "/srv/app/tmp/ocis/storage/users",
            "STORAGE_DRIVER_LOCAL_ROOT": "/srv/app/tmp/ocis/local/root",
            "STORAGE_DRIVER_OWNCLOUD_DATADIR": "/srv/app/tmp/ocis/owncloud/data",
            "STORAGE_METADATA_ROOT": "/srv/app/tmp/ocis/metadata",
            "PROXY_OIDC_INSECURE": "true",
            "STORAGE_HOME_DATA_SERVER_URL": "http://ocis:9155/data",
            "STORAGE_USERS_DATA_SERVER_URL": "http://ocis:9158/data",
            "WEB_UI_CONFIG": "/srv/config/drone/ocis-config.json",
            "WEB_ASSET_PATH": "/var/www/owncloud/web/dist",
            "IDP_IDENTIFIER_REGISTRATION_CONF": "/srv/config/drone/identifier-registration.yml",
            "ACCOUNTS_DATA_PATH": "/srv/app/tmp/ocis-accounts/",
            "PROXY_ENABLE_BASIC_AUTH": True,
        },
        "commands": [
            "cd /var/www/owncloud/ocis-build",
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
        "image": "owncloudci/golang:1.16",
        "pull": "always",
        "commands": [
            "cd /srv/app/src/github.com/owncloud/ocis",
            "cd web",
            "make build",
            "cp bin/web /var/www/owncloud/ocis-web",
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
        "image": "owncloudci/golang:1.16",
        "pull": "always",
        "detach": True,
        "environment": {
            "WEB_UI_CONFIG": "/srv/config/drone/config-oc10-openid.json",
            "WEB_ASSET_PATH": "/var/www/owncloud/web/dist",
        },
        "commands": [
            "cd /var/www/owncloud",
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

def setupNotificationsAppForServer():
    return [{
        "name": "install-notifications-app-on-server",
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "git clone -b master https://github.com/owncloud/notifications.git /var/www/owncloud/server/apps/notifications",
            "cd /var/www/owncloud/server",
            "php occ a:e notifications",
            "php occ a:l",
        ],
    }]

def setupServerAndAppsForIntegrationApp(logLevel):
    return [{
        "name": "setup-server-%s" % config["app"],
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "cd /var/www/owncloud/server/",
            "php occ a:e testing",
            "php occ a:e web",
            "php occ a:l",
            "php occ config:system:set trusted_domains 1 --value=owncloud",
            "php occ log:manage --level %s" % logLevel,
            "php occ config:list",
            "php occ config:system:set skeletondirectory --value=/var/www/owncloud/server/apps/testing/data/webUISkeleton",
            "php occ config:system:set enable_previews --type=boolean --value=false",
            'php occ config:system:set web.baseUrl --value="http://owncloud/index.php/apps/web"',
            "php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool",
        ],
    }]

def setupServerAndApp(logLevel):
    return [{
        "name": "setup-server-%s" % config["app"],
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "cd /var/www/owncloud/server/",
            "php occ a:e testing",
            "php occ a:l",
            "php occ config:system:set trusted_domains 1 --value=owncloud",
            "php occ config:system:set cors.allowed-domains 0 --value=http://web",
            "php occ log:manage --level %s" % logLevel,
            "php occ config:list",
            "php occ config:system:set skeletondirectory --value=/var/www/owncloud/server/apps/testing/data/webUISkeleton",
            'php occ config:system:set web.baseUrl --value="http://web"',
            "php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool",
        ],
    }]

def setupFedServerAndApp(logLevel):
    return [{
        "name": "setup-fed-server-%s" % config["app"],
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "cd /var/www/owncloud/federated/",
            "php occ a:e testing",
            "php occ config:system:set trusted_domains 2 --value=federated",
            "php occ log:manage --level %s" % logLevel,
            "php occ config:list",
            "php occ config:system:set skeletondirectory --value=/var/www/owncloud/federated/apps/testing/data/webUISkeleton",
            "php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool",
        ],
    }]

def fixPermissions():
    return [{
        "name": "fix-permissions",
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "cd /var/www/owncloud/server",
            "chown www-data * -R",
        ],
    }]

def fixPermissionsFederated():
    return [{
        "name": "fix-permissions-federated",
        "image": "owncloudci/php:7.4",
        "pull": "always",
        "commands": [
            "cd /var/www/owncloud/federated",
            "chown www-data * -R",
        ],
    }]

def owncloudLog():
    return [{
        "name": "owncloud-log",
        "image": "owncloud/ubuntu:16.04",
        "pull": "always",
        "detach": True,
        "commands": [
            "tail -f /var/www/owncloud/server/data/owncloud.log",
        ],
    }]

def owncloudLogFederated():
    return [{
        "name": "owncloud-federated-log",
        "image": "owncloud/ubuntu:16.04",
        "pull": "always",
        "detach": True,
        "commands": [
            "tail -f /var/www/owncloud/federated/data/owncloud.log",
        ],
    }]

def copyFilesForUpload():
    return [{
        "name": "copy-files-for-upload",
        "pull": "always",
        "image": "owncloudci/php:7.4",
        "volumes": [{
            "name": "uploads",
            "path": "/filesForUpload",
        }],
        "commands": [
            "ls -la /filesForUpload",
            "cp -a /var/www/owncloud/web/tests/acceptance/filesForUpload/. /filesForUpload",
            "ls -la /filesForUpload",
        ],
    }]

def runWebuiAcceptanceTests(suite, alternateSuiteName, filterTags, extraEnvironment, browser, visualTesting, screenShots):
    environment = {}
    if (filterTags != ""):
        environment["TEST_TAGS"] = filterTags
    if isLocalBrowser(browser):
        environment["LOCAL_UPLOAD_DIR"] = "/uploads"
        if type(suite) == "list":
            paths = ""
            for path in suite:
                paths = paths + "tests/acceptance/features/" + path + " "
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

    if (visualTesting):
        environment["VISUAL_TEST"] = "true"
    if (screenShots):
        environment["SCREENSHOTS"] = "true"
    environment["SERVER_HOST"] = "http://web"
    environment["BACKEND_HOST"] = "http://owncloud"

    for env in extraEnvironment:
        environment[env] = extraEnvironment[env]

    return [{
        "name": "webui-acceptance-tests",
        "image": "owncloudci/nodejs:12",
        "pull": "always",
        "environment": environment,
        "commands": [
            "cd /var/www/owncloud/web",
            "./tests/acceptance/run.sh",
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
            "base": "/var/www/owncloud",
            "path": config["app"],
        },
        "steps": buildOCISCache() +
                 cacheOcis() +
                 listRemoteCache(),
        "depends_on": [],
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
            "source /var/www/owncloud/web/.drone.env",
            "mkdir -p /var/www/owncloud/ocis-build",
            "mc alias set s3 $MC_HOST $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY",
            "mc mirror s3/owncloud/web/ocis-build/$OCIS_COMMITID /var/www/owncloud/ocis-build/",
            "chmod +x /var/www/owncloud/ocis-build/ocis",
        ],
    }]

def buildOCISCache():
    return [{
        "name": "build-ocis",
        "image": "owncloudci/golang:1.16",
        "pull": "always",
        "commands": [
            "./tests/drone/build-ocis.sh",
        ],
    }]

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
            "source": "/var/www/owncloud/ocis-build/**/*",
            "strip_prefix": "/var/www/owncloud/ocis-build",
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
            "mc alias set s3 $MC_HOST $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY",
            "mc find s3/owncloud/web/ocis-build",
        ],
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
            "source": "/var/www/owncloud/web/tests/reports/screenshots/**/*",
            "strip_prefix": "/var/www/owncloud/web/tests/reports/screenshots",
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
        "image": "owncloudci/nodejs:12",
        "pull": "always",
        "commands": [
            "ls -laR /var/www/owncloud/web/tests/vrt",
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
            "source": "/var/www/owncloud/web/tests/vrt/diff/**/*",
            "strip_prefix": "/var/www/owncloud/web/tests/vrt",
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
            "source": "/var/www/owncloud/web/tests/vrt/latest/**/*",
            "strip_prefix": "/var/www/owncloud/web/tests/vrt",
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

def buildGithubCommentVisualDiff(ctx, suite, alternateSuiteName, runningOnOCIS):
    backend = "ocis" if runningOnOCIS else "oc10"
    branch = ctx.build.source if ctx.build.event == "pull_request" else "master"
    return [{
        "name": "build-github-comment-vrt",
        "image": "owncloud/ubuntu:16.04",
        "pull": "always",
        "commands": [
            "cd /var/www/owncloud/web/tests/vrt/diff",
            "cd %s" % backend,
            "ls -la",
            'echo "<details><summary>:boom: Visual regression tests <strong>%s</strong> failed. Please find the screenshots inside ...</summary>\\n\\n${DRONE_BUILD_LINK}/${DRONE_JOB_NUMBER}\\n\\n<p>\\n\\n" >> /var/www/owncloud/web/comments.file' % alternateSuiteName,
            'echo "Diff Image: </br>" >> /var/www/owncloud/web/comments.file',
            'for f in *.png; do echo \'!\'"[$f]($CACHE_ENDPOINT/owncloud/web/screenshots/${DRONE_BUILD_NUMBER}/diff/%s/$f)" >> /var/www/owncloud/web/comments.file; done' % backend,
            "cd ../../latest",
            "cd %s" % backend,
            'echo "Actual Image: </br>" >> /var/www/owncloud/web/comments.file',
            'for f in *.png; do echo \'!\'"[$f]($CACHE_ENDPOINT/owncloud/web/screenshots/${DRONE_BUILD_NUMBER}/latest/%s/$f)" >> /var/www/owncloud/web/comments.file; done' % backend,
            'echo "Comparing Against: </br>" >> /var/www/owncloud/web/comments.file',
            'for f in *.png; do echo \'!\'"[$f](https://raw.githubusercontent.com/owncloud/web/%s/tests/vrt/baseline/%s/$f)" >> /var/www/owncloud/web/comments.file; done' % (branch, backend),
            'echo "\n</p></details>" >> /var/www/owncloud/web/comments.file',
            "more /var/www/owncloud/web/comments.file",
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

def buildGithubComment(suite, alternateSuiteName):
    return [{
        "name": "build-github-comment",
        "image": "owncloud/ubuntu:16.04",
        "pull": "always",
        "commands": [
            "cd /var/www/owncloud/web/tests/reports/screenshots/",
            'echo "<details><summary>:boom: Acceptance tests <strong>%s</strong> failed. Please find the screenshots inside ...</summary>\\n\\n${DRONE_BUILD_LINK}/${DRONE_JOB_NUMBER}\\n\\n<p>\\n\\n" >> /var/www/owncloud/web/comments.file' % alternateSuiteName,
            'for f in *.png; do echo "### $f\n" \'!\'"[$f]($CACHE_ENDPOINT/owncloud/web/screenshots/${DRONE_BUILD_NUMBER}/$f) \n" >> /var/www/owncloud/web/comments.file; done',
            'echo "\n</p></details>" >> /var/www/owncloud/web/comments.file',
            "more /var/www/owncloud/web/comments.file",
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

def githubComment():
    return [{
        "name": "github-comment",
        "image": "jmccann/drone-github-comment:1",
        "pull": "if-not-exists",
        "settings": {
            "message_file": "/var/www/owncloud/web/comments.file",
        },
        "environment": {
            "PLUGIN_API_KEY": {
                "from_secret": "plugin_api_key",
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

def checkStarlark():
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "check-starlark",
        "steps": [
            {
                "name": "format-check-starlark",
                "image": "owncloudci/bazel-buildifier",
                "pull": "always",
                "commands": [
                    "buildifier --mode=check .drone.star",
                ],
            },
            {
                "name": "show-diff",
                "image": "owncloudci/bazel-buildifier",
                "pull": "always",
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
        "depends_on": [],
        "trigger": {
            "ref": [
                "refs/pull/**",
            ],
        },
    }]

def dependsOn(earlierStages, nextStages):
    for earlierStage in earlierStages:
        for nextStage in nextStages:
            nextStage["depends_on"].append(earlierStage["name"])
