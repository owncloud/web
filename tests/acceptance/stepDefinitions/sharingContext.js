const { client } = require('nightwatch-api')
const { When, Given, Then } = require('cucumber')
const fetch = require('node-fetch')
const assert = require('assert')
const { URLSearchParams } = require('url')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const backendHelper = require('../helpers/backendHelper')
const userSettings = require('../helpers/userSettings')
const sharingHelper = require('../helpers/sharingHelper')
const { SHARE_TYPES } = require('../helpers/sharingHelper')
const { runOcc } = require('../helpers/occHelper')
const _ = require('lodash')
const path = require('../helpers/path')
const util = require('util')
const { COLLABORATOR_PERMISSION_ARRAY } = require('../helpers/sharingHelper')

/**
 *
 * @param {string} file
 * @param {string} sharee
 * @param {boolean} shareWithGroup
 * @param {string} role
 * @param {string} permissions
 */
const userSharesFileOrFolderWithUserOrGroup = async function (
  file, sharee, shareWithGroup, role, permissions = undefined, remote = false
) {
  const api = client.page
    .FilesPageElement

  await api.appSideBar().closeSidebar(100)
  await api.filesList().waitForFileVisible(file)
  await api
    .filesList()
    .openFileActionsMenu(file)
    .openCollaboratorsDialog()

  return api.sharingDialog().shareWithUserOrGroup(sharee, shareWithGroup, role, permissions, remote)
}

/**
 *
 * @param {string} file
 * @param {string} sharee
 * @param {string} role
 */
const userSharesFileOrFolderWithUser = function (file, sharee, role) {
  return userSharesFileOrFolderWithUserOrGroup(file, sharee, false, role)
}

/**
 *
 * @param {string} file
 * @param {string} sharee
 * @param {string} role
 */
const userSharesFileOrFolderWithRemoteUser = function (file, sharee, role) {
  return userSharesFileOrFolderWithUserOrGroup(file, sharee, false, role, undefined, true)
}
/**
 *
 * @param {string} file
 * @param {string} sharee
 * @param {string} role
 */
const userSharesFileOrFolderWithGroup = function (file, sharee, role) {
  return userSharesFileOrFolderWithUserOrGroup(file, sharee, true, role)
}

Given('user {string} from remote server has shared {string} with user {string} from local server', function (sharer, file, receiver) {
  receiver = util.format('%s@%s', receiver, client.globals.backend_url)
  return backendHelper.runOnRemoteBackend(
    shareFileFolder, file, sharer, receiver, SHARE_TYPES.federated_cloud_share
  )
})

Given('user {string} from remote server has shared {string} with user {string} from local server with {string} permissions', function (sharer, file, receiver, permission) {
  receiver = util.format('%s@%s', receiver, client.globals.backend_url)
  return backendHelper.runOnRemoteBackend(
    shareFileFolder, file, sharer, receiver, SHARE_TYPES.federated_cloud_share, permission
  )
})

/**
 * creates a new share
 *
 * @param {string} elementToShare  path of file/folder being shared
 * @param {string} sharer  username of the sharer
 * @param receiver  username of the receiver
 * @param shareType  Type of share 0 = user, 1 = group, 3 = public (link), 6 = federated (cloud share).
 * @param {string} permissionString  permissions of the share for valid permissions see sharingHelper.PERMISSION_TYPES
 * @param {string} name name of the link (for public links), default = "New Share"
 * @param {object} extraParams Extra parameters allowed on the share
 * @param {string} extraParams.password Password of the share (public links)
 * @param {string} extraParams.expireDate Expiry date of the share
 */
const shareFileFolder = function (
  elementToShare, sharer, receiver = null, shareType = SHARE_TYPES.user,
  permissionString = 'all', name = null, extraParams = {}
) {
  const params = new URLSearchParams()
  elementToShare = path.resolve(elementToShare)
  const permissions = sharingHelper.humanReadablePermissionsToBitmask(permissionString)
  params.append('path', elementToShare)
  if (receiver) {
    params.append('shareWith', receiver)
  }
  params.append('shareType', shareType)
  params.append('permissions', permissions)
  if (name) {
    params.append('name', name)
  }
  for (const key in extraParams) {
    if (extraParams[key]) {
      params.append(key, extraParams[key])
    }
  }

  return fetch(
    path.join(
      backendHelper.getCurrentBackendUrl(),
      '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json'
    ),
    { method: 'POST', headers: httpHelper.createOCSRequestHeaders(sharer), body: params }
  )
    .then(res => res.json())
    .then(function (json) {
      httpHelper.checkOCSStatus(json, 'Could not create share. Message: ' + json.ocs.meta.message)
    })
}
/**
 * sets up data into a standard format for creating new public link share
 *
 * @param {string} sharer user creating share
 * @param {object} data fields table with required share properties
 * @param {string} data.name Name of the new share(public links)
 * @param {string} data.shareType Type of share
 * @param {string} data.shareWith Receiver of the share
 * @param {string} data.path Path of file/folder/resource to be shared
 * @param {string} data.password Password of the share
 * @param {string} data.permissions Allowed permissions on the share
 * @param {string} data.expireDate Expiry date of the share
 */
const createPublicLink = function (sharer, data) {
  let { path, permissions = 'read', name, password, expireDate } = data

  if (typeof expireDate !== 'undefined') {
    expireDate = sharingHelper.calculateDate(expireDate)
  }

  return shareFileFolder(
    path,
    sharer,
    null,
    SHARE_TYPES.public_link,
    permissions,
    name,
    {
      password,
      expireDate
    }
  )
}
/**
 *
 * @param {string} type user|group
 * @param {string} name
 * @param {string} role
 * @returns {Promise}
 */
const assertCollaboratorslistContains = function (type, name, { role = null, via = null, resharedThrough = null, additionalInfo = null }) {
  if (type !== 'user' && type !== 'group' && type !== 'remote user') {
    throw new Error(`illegal type "${type}"`)
  }

  return client.page.FilesPageElement.SharingDialog.collaboratorsDialog().getCollaboratorsList(null, name)
    .then(shares => {
      const share = shares.find(share => {
        return (name === share.displayName && type === share.shareType.toLowerCase())
      })

      if (!share) {
        assert.fail(
          `"${name}" with type "${type}" was expected to be in share list but was not present. Found collaborators: ` + shares.map(share => `name=${share.displayName} type=${share.shareType}`)
        )
      }

      if (role !== null) {
        assert.strictEqual(role, share.role)
      }
      if (via !== null) {
        assert.strictEqual('Via ' + via, share.viaLabel)
      }
      if (resharedThrough !== null) {
        assert.strictEqual(resharedThrough, share.resharer)
      }
      if (additionalInfo !== null) {
        assert.strictEqual(additionalInfo, share.additionalInfo)
      }
    })
}

/**
 *
 * @param {string} type
 * @param {string} name
 * @returns {Promise}
 */
const assertCollaboratorslistDoesNotContain = function (type, name) {
  if (type !== 'user' && type !== 'group') {
    throw new Error('illegal type')
  }
  const collaboratorsDialog = client.page.FilesPageElement.SharingDialog.collaboratorsDialog()
  return collaboratorsDialog.getCollaboratorsList({
    displayName: collaboratorsDialog.elements.collaboratorInformationSubName,
    shareType: collaboratorsDialog.elements.collaboratorInformationSubShareType
  }, name).then(shares => {
    const share = shares.find(share => {
      return (name === share.displayName && type === share.shareType.toLowerCase())
    })

    if (share) {
      assert.fail(
        `"${name}" was expected to not be in share list but was present.`
      )
    }
  })
}

/**
 *
 * @param {('user'|'group')} type
 * @param {string} displayName
 * @return {Promise<boolean>}
 */
const checkIsListedInAutoComplete = function (type, displayName) {
  return client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
    .then(itemsList => {
      if (itemsList.length === 0) {
        return false
      }
      let displayNameWithType
      if (type === 'user') {
        displayNameWithType = displayName + '\nUser'
      } else {
        displayNameWithType = displayName + '\nGroup'
      }
      return itemsList.includes(displayNameWithType)
    }
    )
}

/**
 * Get all the users whose userID or display name matches with the pattern entered in the search field and then
 * return the display names of the result(users)
 *
 * @param {string} pattern
 * @return {string[]} groupMatchingPattern
 */
const getUsersMatchingPattern = function (pattern) {
  // check if all created users that contain the pattern either in the display name or the username
  // are listed in the autocomplete list
  // in both cases the display name should be listed
  const users = userSettings.getCreatedUsers()
  const usersID = Object.keys(users)
  return usersID.filter(
    id => users[id].displayname.toLowerCase().includes(pattern) || id.includes(pattern)
  ).map(
    id => users[id].displayname
  )
}

/**
 * Get all the groups whose name matches with the pattern entered in the search field
 *
 * @param {string} pattern
 * @return {string[]} groupMatchingPattern
 */
const getGroupsMatchingPattern = function (pattern) {
  const groups = userSettings.getCreatedGroups()
  const groupMatchingPattern = groups.filter(group => group.toLowerCase().includes(pattern))
  return groupMatchingPattern
}

/**
 * Checks if the users found in the autocomplete list consists of all the created users whose display name or userId
 * matches with the pattern
 *
 * @param {string} usersMatchingPattern
 *
 */
const assertUsersInAutocompleteList = async function (usersMatchingPattern) {
  const itemsList = await client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
  const userPostfix = client.page.FilesPageElement.sharingDialog().getUserSharePostfix()
  const usersNotFound = _.difference(
    usersMatchingPattern.map(name => name + userPostfix),
    itemsList
  )
  assert.strictEqual(usersNotFound.length, 0, `could not find ${usersNotFound} in the itemsList`)
}

/**
 * Checks if the groups found in the autocomplete list consists of all the created groups whose name
 * matches with the pattern
 *
 * @param {string} groupMatchingPattern
 *
 */
const assertGroupsInAutocompleteList = async function (groupMatchingPattern) {
  const itemsList = await client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
  const groupPostfix = client.page.FilesPageElement.sharingDialog().getGroupSharePostfix()
  const groupsNotFound = _.difference(
    groupMatchingPattern.map(name => name + groupPostfix),
    itemsList
  )
  assert.strictEqual(groupsNotFound.length, 0, `could not find ${groupsNotFound} in the itemsList`)
}

/**
 * Checks if the users or groups found in the autocomplete list consists of all the created users and groups
 *  with the matched pattern except the current user name and the already shared user or group name
 *
 * @param {string} pattern
 * @param {string} alreadySharedUserOrGroup
 * @param {string} userOrGroup
 */
const assertUsersGroupsWithPatternInAutocompleteListExcluding = async function (pattern, alreadySharedUserOrGroup, userOrGroup) {
  const itemsList = await client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
  const currentUserDisplayName = userSettings.getDisplayNameForUser(client.globals.currentUser)
  const usersMatchingPattern = getUsersMatchingPattern(pattern).filter(
    displayName => {
      return displayName !== currentUserDisplayName && displayName !== alreadySharedUserOrGroup
    }
  )
  const groupPostfix = client.page.FilesPageElement.sharingDialog().getGroupSharePostfix()
  const userPostfix = client.page.FilesPageElement.sharingDialog().getUserSharePostfix()
  await assertUsersInAutocompleteList(usersMatchingPattern)
  assert.ok(
    !itemsList.includes(
      alreadySharedUserOrGroup +
      userOrGroup === 'group' ? groupPostfix : userPostfix
    ),
    `"${alreadySharedUserOrGroup}" was listed in the autocompletion list but should not have been`
  )

  // check if every created group that contains the pattern is listed in the autocomplete list
  const groupMatchingPattern = getGroupsMatchingPattern(pattern).filter(group => group !== alreadySharedUserOrGroup)
  return assertGroupsInAutocompleteList(groupMatchingPattern)
}

Given('user {string} has shared file/folder {string} with user {string}', function (sharer, elementToShare, receiver) {
  return shareFileFolder(elementToShare, sharer, receiver)
})

Given('the user has shared file/folder {string} with user {string}', function (elementToShare, receiver) {
  return shareFileFolder(elementToShare, client.globals.currentUser, receiver)
})

Given(
  'user {string} has shared file/folder {string} with user {string} with {string} permission/permissions',
  function (sharer, elementToShare, receiver, permissions) {
    return shareFileFolder(elementToShare, sharer, receiver, SHARE_TYPES.user, permissions)
  }
)

Given('user {string} has shared file/folder {string} with group {string}', function (sharer, elementToShare, receiver) {
  return shareFileFolder(elementToShare, sharer, receiver, SHARE_TYPES.group)
})

Given('user {string} has shared file/folder {string} with group {string} with {string} permission/permissions',
  function (sharer, elementToShare, receiver, permissions) {
    return shareFileFolder(elementToShare, sharer, receiver, SHARE_TYPES.group, permissions)
  })

Given(
  'user {string} has shared file/folder {string} with link with {string} permissions',
  function (sharer, elementToShare, permissions) {
    return shareFileFolder(elementToShare, sharer, null, SHARE_TYPES.public_link, permissions)
  }
)

Given(
  'user {string} has shared file/folder {string} with link with {string} permissions and password {string}',
  function (sharer, elementToShare, permissions, password) {
    return shareFileFolder(
      elementToShare,
      sharer,
      null,
      SHARE_TYPES.public_link,
      permissions,
      null,
      { password: password }
    )
  }
)

Given('the administrator has enabled exclude groups from sharing', function () {
  return runOcc(
    [
      'config:app:set core shareapi_exclude_groups --value=yes'
    ]
  )
})

Given('the administrator has excluded group {string} from sharing', async function (group) {
  const configList = await runOcc([
    'config:list'
  ])
  const config = _.get(configList, 'ocs.data.stdOut')
  const configParsed = JSON.parse(config)
  const initialExcludedGroup = JSON.parse(_.get(configParsed, 'apps.core.shareapi_exclude_groups_list') || '[]')
  if (!initialExcludedGroup.includes(group)) {
    initialExcludedGroup.push(group)
    const resultGroupList = initialExcludedGroup.map((res) => '"' + res + '"')
    const resultToString = resultGroupList.join(',')
    return runOcc(
      [
        'config:app:set',
        'core',
        'shareapi_exclude_groups_list',
        '--value=[' + resultToString + ']'
      ]
    )
  }
})

Given('the administrator has set the minimum characters for sharing autocomplete to {string}', function (value) {
  return runOcc(
    ['config:system:set user.search_min_length --value=' + value]
  )
})

Given('user {string} has created a public link with following settings',
  function (sharer, dataTable) {
    return createPublicLink(sharer, dataTable.rowsHash())
  })

Given('the administrator has excluded group {string} from receiving shares', async function (group) {
  const configList = await runOcc([
    'config:list'
  ])
  const config = _.get(configList, 'ocs.data.stdOut')
  const configParsed = JSON.parse(config)
  const initialExcludedGroup = JSON.parse(_.get(configParsed, 'apps.files_sharing.blacklisted_receiver_groups') || '[]')
  if (!initialExcludedGroup.includes(group)) {
    initialExcludedGroup.push(group)
    let excludedGroups = initialExcludedGroup.map((res) => `"${res}"`)
    excludedGroups = excludedGroups.join(',')
    return runOcc(
      [
        'config:app:set',
        'files_sharing',
        'blacklisted_receiver_groups',
        '--value=[' + excludedGroups + ']'
      ]
    )
  }
})

When('the user opens the share creation dialog in the webUI', function () {
  return client.page.FilesPageElement.SharingDialog.collaboratorsDialog().clickCreateShare()
})

When('the user cancels the share creation dialog in the webUI', function () {
  return client.page.FilesPageElement.sharingDialog().clickCancel()
})

When('the user types {string} in the share-with-field', function (input) {
  return client.page.FilesPageElement.sharingDialog().enterAutoComplete(input)
})

When('the user sets custom permission for current role of collaborator {string} for folder/file {string} to {string} using the webUI',
  async function (user, resource, permissions) {
    const api = client.page
      .FilesPageElement

    await api
      .appSideBar()
      .closeSidebar(100)
      .openSharingDialog(resource)

    return api.sharingDialog().changeCustomPermissionsTo(user, permissions)
  })

When('the user disables all the custom permissions of collaborator {string} for file/folder {string} using the webUI',
  async function (collaborator, resource) {
    const api = client.page
      .FilesPageElement

    await api.appSideBar()
      .closeSidebar(100)
      .openSharingDialog(resource)

    return api.sharingDialog().disableAllCustomPermissions(collaborator)
  })

const assertSharePermissions = async function (currentSharePermissions, permissions = undefined) {
  let expectedPermissionArray
  if (permissions !== undefined) {
    expectedPermissionArray = await client.page.FilesPageElement.sharingDialog().getArrayFromPermissionString(permissions)
  }
  for (let i = 0; i < COLLABORATOR_PERMISSION_ARRAY.length; i++) {
    const permissionName = COLLABORATOR_PERMISSION_ARRAY[i]
    if (permissions !== undefined) {
      // check all the required permissions are set
      if (expectedPermissionArray.includes(permissionName)) {
        assert.strictEqual(currentSharePermissions[permissionName], true, `Permission ${permissionName} is not set`)
      } else {
        // check unexpected permissions are not set or absent from the array
        assert.ok(!currentSharePermissions[permissionName], `Permission ${permissionName} is set`)
      }
    } else {
      // check all the permissions are not set or absent from the array
      assert.ok(!currentSharePermissions[permissionName], `Permission ${permissionName} is set`)
    }
  }
}

Then('custom permission/permissions {string} should be set for user {string} for file/folder {string} on the webUI',
  async function (permissions, user, resource) {
    await client.page
      .FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .waitForFileVisible(resource)
    const currentSharePermissions = await client.page
      .FilesPageElement
      .filesList()
      .openFileActionsMenu(resource)
      .openCollaboratorsDialog()
      .getDisplayedPermission(user)

    return assertSharePermissions(currentSharePermissions, permissions)
  })

Then('no custom permissions should be set for collaborator {string} for file/folder {string} on the webUI', async function (user, resource) {
  await client.page
    .FilesPageElement
    .appSideBar()
    .closeSidebar(100)
    .waitForFileVisible(resource)
  const currentSharePermissions = await client.page
    .FilesPageElement
    .filesList()
    .openFileActionsMenu(resource)
    .openCollaboratorsDialog()
    .getDisplayedPermission(user)
  return assertSharePermissions(currentSharePermissions)
})

When('the user shares file/folder/resource {string} with group {string} as {string} using the webUI', userSharesFileOrFolderWithGroup)

When('the user shares file/folder/resource {string} with remote user {string} as {string} using the webUI', userSharesFileOrFolderWithRemoteUser)

Then('it should not be possible to share file/folder {string} using the webUI', async function (resource) {
  const appSideBar = client.page.FilesPageElement.appSideBar()
  const filesList = client.page.FilesPageElement.filesList()
  // assumes current webUI state as no sidebar open for any resource
  const state = await filesList.isSharingButtonPresent(resource)
  assert.ok(
    !state,
    `Error: Sharing button for resource ${resource} is not in disabled state`
  )
  await filesList.openSideBar(resource)
  const sidebarLinkTabState = await appSideBar.isLinksTabPresentOnCurrentSidebar()
  assert.ok(
    !sidebarLinkTabState,
    `Error: Sidebar 'Links' tab for resource ${resource} is present`
  )
  const sidebarCollaboratorsTabState = await appSideBar.isCollaboratorsTabPresentOnCurrentSidebar()
  assert.ok(
    !sidebarCollaboratorsTabState,
    `Error: Sidebar 'Collaborators' tab for resource ${resource} is present`
  )
})

When('the user shares file/folder/resource {string} with user {string} as {string} using the webUI', userSharesFileOrFolderWithUser)

When('the user shares file/folder/resource {string} with user {string} as {string} with permission/permissions {string} using the webUI', function (resource, shareWithUser, role, permissions) {
  return userSharesFileOrFolderWithUserOrGroup(resource, shareWithUser, false, role, permissions)
})

When('the user selects the following collaborators for the share as {string} with {string} permissions:', async function (role, permissions, usersTable) {
  const users = usersTable.hashes()
  const dialog = client.page.FilesPageElement.sharingDialog()

  for (const { collaborator, type } of users) {
    await dialog.selectCollaboratorForShare(collaborator, type === 'group')
  }

  await dialog.selectRoleForNewCollaborator(role)
  await dialog.selectPermissionsOnPendingShare(permissions)
})

When('the user removes {string} as a collaborator from the share', function (user) {
  return client.page.FilesPageElement.sharingDialog().removePendingCollaboratorForShare(user)
})

When('the user shares with the selected collaborators', function () {
  return client.page.FilesPageElement.sharingDialog()
    .confirmShare()
    .waitForOutstandingAjaxCalls()
})

Then('all users and groups that contain the string {string} in their name should be listed in the autocomplete list on the webUI', async function (pattern) {
  const currentUserDisplayName = userSettings.getDisplayNameForUser(client.globals.currentUser)

  // check if all created users that contain the pattern either in the display name or the username
  // are listed in the autocomplete list
  // in both cases the display name should be listed
  const usersMatchingPattern = getUsersMatchingPattern(pattern).filter(
    displayName => {
      return displayName !== currentUserDisplayName
    }
  )
  await assertUsersInAutocompleteList(usersMatchingPattern)
  // check if every created group that contains the pattern is listed in the autocomplete list
  const groupMatchingPattern = getGroupsMatchingPattern(pattern)
  await assertGroupsInAutocompleteList(groupMatchingPattern)
})

Then('all users and groups that contain the string {string} in their name should be listed in the autocomplete list on the webUI except user {string}', function (pattern, alreadySharedUser) {
  return assertUsersGroupsWithPatternInAutocompleteListExcluding(pattern, alreadySharedUser, 'user')
})

Then('all users and groups that contain the string {string} in their name should be listed in the autocomplete list on the webUI except group {string}', function (pattern, alreadySharedGroup) {
  return assertUsersGroupsWithPatternInAutocompleteListExcluding(pattern, alreadySharedGroup, 'group')
})

Then('only users and groups that contain the string {string} in their name or displayname should be listed in the autocomplete list on the webUI', function (pattern) {
  return client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
    .then(itemsList => {
      itemsList.forEach(item => {
        const displayedName = item.split('\n')[0]
        var found = false
        for (var userId in userSettings.getCreatedUsers()) {
          const userDisplayName = userSettings.getDisplayNameForUser(userId)
          if (userDisplayName === displayedName &&
            (userDisplayName.toLowerCase().includes(pattern) || userId.toLowerCase().includes(pattern))
          ) {
            found = true
          }
        }
        userSettings.getCreatedGroups().forEach(function (groupId) {
          if (displayedName === groupId && groupId.toLowerCase().includes(pattern)) {
            found = true
          }
        })
        assert.strictEqual(
          found,
          true,
          `"${displayedName}" was listed in autocomplete list, but should not have been. ` +
          '(check if that is a manually added user/group)'
        )
      })
    })
})

Then('every item listed in the autocomplete list on the webUI should contain {string}', function (pattern) {
  return client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
    .then(itemsList => {
      itemsList.forEach(item => {
        if (!item.toLowerCase().includes(pattern)) {
          assert.fail(`sharee ${item} does not contain pattern ${pattern}`)
        }
      })
    })
})

When('the user selects role {string}', function (role) {
  return client.page.FilesPageElement.sharingDialog().selectRoleForNewCollaborator(role)
})

When('the user confirms the share', function () {
  return client.page.FilesPageElement.sharingDialog().confirmShare()
})

Then('the users own name should not be listed in the autocomplete list on the webUI', function () {
  const currentUserDisplayName = userSettings.getDisplayNameForUser(client.globals.currentUser)
  return client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
    .then(itemsList => {
      itemsList.forEach(item => {
        const displayedName = item.split('\n')[0]
        assert.notStrictEqual(
          displayedName,
          currentUserDisplayName,
          `Users own name: ${currentUserDisplayName} was not expected to be listed in the autocomplete list but was`
        )
      })
    })
})

Then('{string} {string} should not be listed in the autocomplete list on the webUI', async function (type, displayName) {
  const presence = await checkIsListedInAutoComplete(type, displayName)
  assert.ok(presence === false,
    `${displayName} was expected to not be listed in the autocomplete list but was found`)
})

Then('{string} {string} should be listed in the autocomplete list on the webUI', async function (type, displayName) {
  const presence = await checkIsListedInAutoComplete(type, displayName)
  assert.ok(presence === true,
    `${displayName} was expected to be listed in the autocomplete list but was not found`)
})

When('the user opens the share dialog for file/folder/resource {string} using the webUI', function (file) {
  return client.page.FilesPageElement.filesList().openSharingDialog(file)
})

When('the user opens the link share dialog for file/folder/resource {string} using the webUI', function (file) {
  return client.page.FilesPageElement.filesList().openPublicLinksDialog(file)
})

When('the user deletes {string} as collaborator for the current file/folder using the webUI', function (user) {
  return client.page.FilesPageElement.SharingDialog.collaboratorsDialog().deleteShareWithUserGroup(user)
})

When('the user deletes {string} as remote collaborator for the current file/folder using the webUI', function (user) {
  user = util.format('%s@%s', user, client.globals.remote_backend_url)
  return client.page.FilesPageElement.SharingDialog.collaboratorsDialog().deleteShareWithUserGroup(user)
})

When(
  'the user changes the collaborator role of {string} for file/folder {string} to {string} using the webUI',
  async function (collaborator, resource, newRole) {
    const api = client.page.FilesPageElement
    await api
      .appSideBar()
      .closeSidebar(100)
      .openSharingDialog(resource)

    return api.sharingDialog().changeCollaboratorRole(collaborator, newRole)
  }
)

Then('user {string} should be listed as {string} in the collaborators list on the webUI', function (user, role) {
  return assertCollaboratorslistContains('user', user, { role })
})

Then('remote user {string} should be listed as {string} via {string} in the collaborators list on the webUI', function (user, role, via) {
  user = util.format('%s@%s', user, client.globals.remote_backend_url)
  return assertCollaboratorslistContains('remote user', user, { role, via })
})

Then('user {string} should be listed as {string} via {string} in the collaborators list on the webUI', function (user, role, via) {
  return assertCollaboratorslistContains('user', user, { role, via })
})

Then('user {string} should be listed as {string} reshared through {string} in the collaborators list on the webUI', function (user, role, resharedThrough) {
  return assertCollaboratorslistContains('user', user, { role, resharedThrough })
})

Then('user {string} should be listed as {string} reshared through {string} via {string} in the collaborators list on the webUI', function (user, role, resharedThrough, via) {
  return assertCollaboratorslistContains('user', user, { role, resharedThrough, via })
})

Then('user {string} should be listed with additional info {string} in the collaborators list on the webUI', function (user, additionalInfo) {
  return assertCollaboratorslistContains('user', user, { additionalInfo })
})

Then('user {string} should be listed without additional info in the collaborators list on the webUI', function (user) {
  return assertCollaboratorslistContains('user', user, { additionalInfo: false })
})

Then('user {string} should be listed as {string} in the collaborators list for file/folder/resource {string} on the webUI',
  async function (user, role, resource) {
    await client.page
      .FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .waitForFileVisible(resource)
    await client.page
      .FilesPageElement
      .filesList()
      .openFileActionsMenu(resource)
      .openCollaboratorsDialog()

    return assertCollaboratorslistContains('user', user, { role })
  })

Then('group {string} should be listed as {string} in the collaborators list on the webUI', function (group, role) {
  return assertCollaboratorslistContains('group', group, { role })
})

Then('group {string} should be listed as {string} via {string} in the collaborators list on the webUI', function (group, role, via) {
  return assertCollaboratorslistContains('group', group, { role, via })
})

Then('group {string} should be listed as {string} in the collaborators list for file/folder/resource {string} on the webUI',
  async function (group, role, resource) {
    await client.page
      .FilesPageElement
      .appSideBar()
      .closeSidebar(100)
      .waitForFileVisible(resource)
    await client.page
      .FilesPageElement
      .filesList()
      .openFileActionsMenu(resource)
      .openCollaboratorsDialog()
    return assertCollaboratorslistContains('group', group, { role })
  })

Then('user {string} should not be listed in the collaborators list on the webUI', function (user) {
  return assertCollaboratorslistDoesNotContain('user', user)
})

Then('group {string} should not be listed in the collaborators list on the webUI', function (group) {
  return assertCollaboratorslistDoesNotContain('group', group)
})

Then('user {string} should have received a share with these details:', function (user, expectedDetailsTable) {
  return sharingHelper.assertUserHasShareWithDetails(user, expectedDetailsTable, { shared_with_me: true })
})

Given('user {string} has created a new public link for resource {string}', function (user, resource) {
  return shareFileFolder(resource, user, '', SHARE_TYPES.public_link)
})

Then('user {string} should have shared a file/folder with these details:', function (user, expectedDetailsTable) {
  return sharingHelper.assertUserHasShareWithDetails(user, expectedDetailsTable, { shared_with_me: false })
})

Then('user {string} should have shared a file/folder {string} with these details:', function (user, path, expectedDetailsTable) {
  return sharingHelper.assertUserHasShareWithDetails(user, expectedDetailsTable, { shared_with_me: false, path })
})

Then('user {string} should have a share with these details:', function (user, expectedDetailsTable) {
  return sharingHelper.assertUserHasShareWithDetails(user, expectedDetailsTable)
})

Then('the user should not be able to share file/folder/resource {string} using the webUI', async function (resource) {
  const api = client.page.FilesPageElement
  await api
    .appSideBar()
    .closeSidebar(100)
    .waitForFileVisible(resource)
  const shareResponse = await api
    .filesList()
    .openFileActionsMenu(resource)
    .openCollaboratorsDialog()
    .getSharingPermissionMsg()
  const noSharePermissionsMsgFormat = "You don't have permission to share this %s."
  const noSharePermissionsFileMsg = util.format(noSharePermissionsMsgFormat, 'file')
  const noSharePermissionsFolderMsg = util.format(noSharePermissionsMsgFormat, 'folder')
  return assert.ok(
    noSharePermissionsFileMsg === shareResponse ||
    noSharePermissionsFolderMsg === shareResponse,
    `Expected: no permission to share resource '${resource}' but found: '${shareResponse}'`
  )
})

Then('the collaborators list for file/folder/resource {string} should be empty', async function (resource) {
  const api = client.page.FilesPageElement
  await api
    .appSideBar()
    .closeSidebar(100)
    .openSharingDialog(resource)
  const count = (await api
    .SharingDialog.collaboratorsDialog()
    .getCollaboratorsList({})
  ).length
  assert.strictEqual(count, 0, `Expected to have no collaborators for '${resource}', Found: ${count}`)
})

Then('the current collaborators list should have order {string}', async function (expectedNames) {
  const actualNames = (await client.page.FilesPageElement.SharingDialog.collaboratorsDialog().getCollaboratorsListNames()).join(',')
  assert.strictEqual(actualNames, expectedNames, `Expected to have collaborators in order '${expectedNames}', Found: ${actualNames}`)
})

Then('file/folder {string} shared by {string} should be in {string} state on the webUI',
  async function (resource, sharer, expectedStatus) {
    const currentStatus = await client.page.sharedWithMePage().getShareStatusOfResource(resource, sharer)
    return assert.strictEqual(
      currentStatus,
      expectedStatus,
      `Expected resource '${resource}' shared by '${sharer}' to be
      in state '${expectedStatus}' but it is in state: '${currentStatus}'!`
    )
  })

When('the user declines share {string} offered by user {string} using the webUI', function (filename, user) {
  return client.page.sharedWithMePage().declineAcceptFile('Decline', filename, user)
})

When('the user accepts share {string} offered by user {string} using the webUI', function (filename, user) {
  return client.page.sharedWithMePage().declineAcceptFile('Accept', filename, user)
})

Then('the file {string} shared by {string} should be in {string} state on the webUI after a page reload',
  async function (filename, sharer, expectedStatus) {
    await client.refresh()
    const currentStatus = await client.page.sharedWithMePage().getShareStatusOfResource(filename, sharer)
    return assert.strictEqual(
      currentStatus,
      expectedStatus,
      `Expected resource '${filename}'  shared by '${sharer}' to
       be in state '${expectedStatus}' but it is in state: '${currentStatus}'!`
    )
  })

Then('the autocomplete list should not be displayed on the webUI', async function () {
  const isVisible = await client.page.FilesPageElement.sharingDialog().isAutocompleteListVisible()
  return assert.ok(!isVisible, 'Expected: autocomplete list "not visible" but found "visible"')
})

Given('user {string} has declined the share {string} offered by user {string}', function (user, filename, sharer) {
  return sharingHelper.declineShare(filename, user, sharer)
})

Given('user {string} has accepted the share {string} offered by user {code}', function (user, filename, sharer) {
  return sharingHelper.acceptShare(filename, user, sharer)
})

Then('the file {string} shared by {string} should not be in {string} state',
  async function (filename, sharer, expectedStatus) {
    const currentStatus = await client.page.sharedWithMePage().getShareStatusOfResource(filename, sharer)
    return assert.notStrictEqual(
      currentStatus,
      expectedStatus,
      `Expected resource '${filename}' shared by '${sharer}' not to be
      present with status '${expectedStatus}' but got found: '${currentStatus}'!`
    )
  })

Then('file/folder {string} should be marked as shared by {string} on the webUI',
  async function (element, sharer) {
    const username = await client.page.sharedWithMePage().getSharedByUser(element)
    return assert.strictEqual(
      username,
      sharer,
      `Expected username: '${sharer}', but found '${username}'`
    )
  })

Then('user {string} should not have created any shares', async function (user) {
  const shares = await sharingHelper.getAllSharesSharedByUser(user)
  assert.strictEqual(shares.length, 0, 'There should not be any share, but there are')
})

Then('the following resources should have the following collaborators', async function (dataTable) {
  for (const { fileName, expectedCollaborators } of dataTable.hashes()) {
    const collaboratorsArray = await client
      .page.FilesPageElement.filesList().getCollaboratorsForResource(fileName)

    const expectedCollaboratorsArray = expectedCollaborators.split(',').map(s => s.trim())
    assert.ok(
      _.intersection(collaboratorsArray, expectedCollaboratorsArray).length === expectedCollaboratorsArray.length,
      `Expected collaborators to be the same for "${fileName}": expected [` + expectedCollaboratorsArray.join(', ') + '] got [' + collaboratorsArray.join(', ') + ']'
    )
  }
})
