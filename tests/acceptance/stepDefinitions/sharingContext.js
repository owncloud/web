const { client } = require('nightwatch-api')
const { When, Then } = require('@cucumber/cucumber')
const assert = require('assert')
require('url-search-params-polyfill')
const userSettings = require('../helpers/userSettings')
const sharingHelper = require('../helpers/sharingHelper')
const { SHARE_STATE } = require('../helpers/sharingHelper')
const _ = require('lodash')
const util = require('util')
const { COLLABORATOR_PERMISSION_ARRAY, calculateDate } = require('../helpers/sharingHelper')

/**
 *
 * @param {string} file
 * @param {string} sharee
 * @param {boolean} shareWithGroup
 * @param {string} role
 * @param {string} permissions
 * @param {boolean} remote
 * @param {boolean} quickAction Asserts whether the quick actions should be used to open new collaborators panel
 */
const userSharesFileOrFolderWithUserOrGroup = async function (
  file,
  sharee,
  shareWithGroup,
  role,
  permissions = undefined,
  remote = false,
  quickAction = false
) {
  const api = client.page.FilesPageElement
  if (quickAction) {
    await api.filesList().useQuickAction(file, 'collaborators')
  } else {
    await api.filesList().openSharingDialog(file)
  }

  return api
    .sharingDialog()
    .shareWithUserOrGroup(sharee, shareWithGroup, role, permissions, remote, null)
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

Then(
  'the user should see an error message on the collaborator share dialog saying {string}',
  async function (expectedMessage) {
    const actualMessage = await client.page.FilesPageElement.sharingDialog().getErrorMessage()
    return client.assert.strictEqual(actualMessage, expectedMessage)
  }
)

/**
 *
 * @param {string} type user|group
 * @param {string} name
 * @param {string} role
 * @param {string} resharedThrough
 * @param {string} additionalInfo
 * @returns {Promise}
 */
const assertCollaboratorslistContains = function (
  type,
  name,
  { role = undefined, resharedThrough = undefined, additionalInfo = undefined }
) {
  if (type !== 'user' && type !== 'group' && type !== 'remote user') {
    throw new Error(`illegal type "${type}"`)
  }

  return client.page.FilesPageElement.SharingDialog.collaboratorsDialog()
    .getCollaboratorsList(null, name)
    .then((shares) => {
      const share = shares.find((share) => {
        return (
          name === share.displayName && (!share.shareType || type === share.shareType.toLowerCase())
        )
      })

      if (!share) {
        assert.fail(
          `"${name}" with type "${type}" was expected to be in share list but was not present. Found collaborators: ` +
            shares.map((share) => `name=${share.displayName} type=${share.shareType}`)
        )
      }

      if (role) {
        assert.strictEqual(role, share.role)
      }
      if (resharedThrough) {
        assert.strictEqual(`Shared by ${resharedThrough}`, share.resharer)
      }
      if (additionalInfo) {
        assert.strictEqual(`${additionalInfo}`, share.additionalInfo)
      }
    })
}

/**
 *
 * @param {string} type
 * @param {string} name
 * @returns {Promise}
 */
const assertCollaboratorslistDoesNotContain = async function (type, name) {
  if (type !== 'user' && type !== 'group') {
    throw new Error('illegal type')
  }
  const collaboratorsDialog = client.page.FilesPageElement.SharingDialog.collaboratorsDialog()

  // check if fileslist is not present because it's empty
  try {
    await client.waitForElementNotPresent({
      selector: '#files-collaborators-list',
      locateStrategy: 'css'
    })
    return
  } catch (e) {}

  return collaboratorsDialog
    .getCollaboratorsList(
      {
        displayName: collaboratorsDialog.elements.collaboratorInformationSubName
      },
      null,
      client.globals.waitForNegativeConditionTimeout
    )
    .then((shares) => {
      const share = shares.find((share) => {
        return (
          name === share.displayName && (!share.shareType || type === share.shareType.toLowerCase())
        )
      })

      if (share) {
        assert.fail(`"${name}" was expected to not be in share list but was present.`)
      }
    })
}

/**
 * Get all the users whose userID or display name matches with the pattern entered in the search field and then
 * return the display names of the result(users)
 *
 * @param {string} pattern
 * @return {string[]} groupMatchingPattern
 */
const getUsersMatchingPattern = async function (pattern) {
  // check if all created users that contain the pattern either in the display name or the username
  // are listed in the autocomplete list
  // in both cases the display name should be listed
  const users = await userSettings.getCreatedUsers()
  const usersID = Object.keys(users)
  return usersID
    .filter((id) => users[id].displayname.toLowerCase().includes(pattern) || id.includes(pattern))
    .map((id) => users[id].displayname)
}

/**
 * Get all the groups whose name matches with the pattern entered in the search field
 *
 * @param {string} pattern
 * @return {string[]} groupMatchingPattern
 */
const getGroupsMatchingPattern = async function (pattern) {
  const groups = await userSettings.getCreatedGroups()
  const groupMatchingPattern = groups.filter((group) => group.toLowerCase().includes(pattern))
  return groupMatchingPattern
}

/**
 * Checks if the users or groups found in the autocomplete list consists of all the created users and groups
 *  with the matched pattern except the current user name and the already shared user or group name
 *
 * @param {string} pattern
 * @param {string} alreadySharedUserOrGroup
 * @param {string} userOrGroup
 */
const assertUsersGroupsWithPatternInAutocompleteListExcluding = async function (
  pattern,
  alreadySharedUserOrGroup,
  userOrGroup
) {
  const sharingDialog = client.page.FilesPageElement.sharingDialog()
  const currentUserDisplayName = await userSettings.getDisplayNameForUser(
    client.globals.currentUser
  )
  let usersMatchingPattern = await getUsersMatchingPattern(pattern)
  usersMatchingPattern = usersMatchingPattern.filter((displayName) => {
    return displayName !== currentUserDisplayName && displayName !== alreadySharedUserOrGroup
  })
  let groupMatchingPattern = await getGroupsMatchingPattern(pattern)
  groupMatchingPattern = groupMatchingPattern.filter((group) => group !== alreadySharedUserOrGroup)

  if (usersMatchingPattern.length + groupMatchingPattern.length > 5) {
    await sharingDialog.displayAllCollaboratorsAutocompleteResults()
  }

  return sharingDialog
    .assertUsersInAutocompleteList(usersMatchingPattern)
    .assertGroupsInAutocompleteList(groupMatchingPattern)
    .assertAlreadyExistingCollaboratorIsNotInAutocompleteList(alreadySharedUserOrGroup, userOrGroup)
}

/**
 *
 * @param {string} resource
 * @param {string} sharee
 * @param {string} days
 * @param {boolean} shareWithGroup
 * @param {boolean} remote
 * @param {boolean} expectToSucceed
 */
const userSharesFileOrFolderWithUserOrGroupWithExpirationDate = async function ({
  resource,
  sharee,
  days,
  shareWithGroup = false,
  remote = false
}) {
  const api = client.page.FilesPageElement
  await api.filesList().openSharingDialog(resource)

  return api
    .sharingDialog()
    .shareWithUserOrGroup(sharee, shareWithGroup, 'Viewer', undefined, remote, days)
}

/**
 * @param {string} collaborator
 * @param {string} resource
 * @param {string} value
 */
const checkCollaboratorsExpirationDate = async function (collaborator, resource, value) {
  const api = client.page.FilesPageElement
  await api.filesList().openSharingDialog(resource)
  return api.sharingDialog().checkExpirationDate(collaborator, value)
}

When('the user types {string} in the share-with-field', async function (input) {
  return await client.page.FilesPageElement.sharingDialog().enterAutoComplete(input)
})

When(
  'the user sets custom permission for current role of collaborator {string} for folder/file {string} to {string} using the webUI',
  async function (user, resource, permissions) {
    const api = client.page.FilesPageElement
    await api.filesList().openSharingDialog(resource)
    return api.sharingDialog().changeCustomPermissionsTo(user, permissions)
  }
)

When(
  'the user disables all the custom permissions of collaborator {string} for file/folder {string} using the webUI',
  async function (collaborator, resource) {
    const api = client.page.FilesPageElement
    await api.filesList().openSharingDialog(resource)
    return api.sharingDialog().changeCustomPermissionsTo(collaborator)
  }
)

const assertSharePermissions = async function (currentSharePermissions, permissions = undefined) {
  let expectedPermissionArray
  if (permissions !== undefined) {
    expectedPermissionArray =
      await client.page.FilesPageElement.sharingDialog().getArrayFromPermissionString(permissions)
  }
  for (let i = 0; i < COLLABORATOR_PERMISSION_ARRAY.length; i++) {
    const permissionName = COLLABORATOR_PERMISSION_ARRAY[i]
    if (permissions !== undefined) {
      // check all the required permissions are set
      if (expectedPermissionArray.includes(permissionName)) {
        assert.strictEqual(
          currentSharePermissions[permissionName],
          true,
          `Permission ${permissionName} is not set`
        )
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

Then(
  'custom permission/permissions {string} should be set for user {string} for file/folder {string} on the webUI',
  async function (permissions, user, resource) {
    await client.page.FilesPageElement.filesList().openSharingDialog(resource)
    const currentSharePermissions =
      await client.page.FilesPageElement.sharingDialog().getDisplayedPermission(user)
    return assertSharePermissions(currentSharePermissions, permissions)
  }
)

Then(
  'no custom permissions should be set for collaborator {string} for file/folder {string} on the webUI',
  async function (user, resource) {
    await client.page.FilesPageElement.filesList().openSharingDialog(resource)
    const currentSharePermissions =
      await client.page.FilesPageElement.sharingDialog().getDisplayedPermission(user)
    return assertSharePermissions(currentSharePermissions)
  }
)

When(
  'the user shares file/folder/resource {string} with group {string} as {string} using the webUI',
  userSharesFileOrFolderWithGroup
)

When(
  'the user shares file/folder/resource {string} with remote user {string} as {string} using the webUI',
  userSharesFileOrFolderWithRemoteUser
)

Then(
  'it should not be possible to share file/folder {string} using the webUI',
  async function (resource) {
    const appSideBar = client.page.FilesPageElement.appSideBar()
    const filesList = client.page.FilesPageElement.filesList()
    // assumes current webUI state as no sidebar open for any resource
    const state = await filesList.isSharingButtonPresent(resource)
    assert.ok(!state, `Error: Sharing button for resource ${resource} is not in disabled state`)
    await filesList.openSideBar(resource)
    const linkItemState = await appSideBar.isLinksPanelSelectable(false)
    assert.ok(!linkItemState, `Error: Sidebar 'Links' panel for resource ${resource} is present`)
    const collaboratorsItemState = await appSideBar.isSharingPanelSelectable(false)
    assert.ok(
      !collaboratorsItemState,
      `Error: Sidebar 'People' panel for resource ${resource} is present`
    )
  }
)

When(
  'the user shares file/folder/resource {string} with user {string} as {string} using the webUI',
  userSharesFileOrFolderWithUser
)

When(
  'the user shares file/folder/resource {string} with user {string} as {string} with permission/permissions {string} using the webUI',
  function (resource, shareWithUser, role, permissions) {
    return userSharesFileOrFolderWithUserOrGroup(resource, shareWithUser, false, role, permissions)
  }
)

When(
  'the user selects the following collaborators for the share as {string} with {string} permissions:',
  async function (role, permissions, usersTable) {
    const users = usersTable.hashes()
    const dialog = client.page.FilesPageElement.sharingDialog()
    await dialog.shareWithUsersOrGroups(users, role, permissions, false)
  }
)

When('the user removes {string} as a collaborator from the share', function (user) {
  return client.page.FilesPageElement.sharingDialog().removePendingCollaboratorForShare(user)
})

Then(
  /^(user|group) "([^"]*)" should not be visible in the collaborators selected options in the webUI$/,
  async function (userOrGroup, userOrGroupName) {
    await client.page.FilesPageElement.sharingDialog().isGroupNotPresentInSelectedCollaboratorsOptions(
      userOrGroup,
      userOrGroupName
    )
  }
)

When('the user shares with the selected collaborators', function () {
  return client.page.FilesPageElement.sharingDialog()
    .initAjaxCounters()
    .confirmShare()
    .waitForOutstandingAjaxCalls()
})

Then(
  'all users and groups that contain the string {string} in their name should be listed in the autocomplete list on the webUI',
  async function (pattern) {
    const sharingDialog = client.page.FilesPageElement.sharingDialog()
    const currentUserDisplayName = await userSettings.getDisplayNameForUser(
      client.globals.currentUser
    )

    // check if all created users that contain the pattern either in the display name or the username
    // are listed in the autocomplete list
    // in both cases the display name should be listed
    let usersMatchingPattern = await getUsersMatchingPattern(pattern)
    usersMatchingPattern = usersMatchingPattern.filter((displayName) => {
      return displayName !== currentUserDisplayName
    })

    // check if every created group that contains the pattern is listed in the autocomplete list
    const groupMatchingPattern = await getGroupsMatchingPattern(pattern)

    if (usersMatchingPattern.length + groupMatchingPattern.length > 5) {
      await sharingDialog.displayAllCollaboratorsAutocompleteResults()
    }

    return sharingDialog
      .assertUsersInAutocompleteList(usersMatchingPattern)
      .assertGroupsInAutocompleteList(groupMatchingPattern)
  }
)

Then(
  'all users and groups that contain the string {string} in their name should be listed in the autocomplete list on the webUI except user {string}',
  function (pattern, alreadySharedUser) {
    return assertUsersGroupsWithPatternInAutocompleteListExcluding(
      pattern,
      alreadySharedUser,
      'user'
    )
  }
)

Then(
  'all users and groups that contain the string {string} in their name should be listed in the autocomplete list on the webUI except group {string}',
  function (pattern, alreadySharedGroup) {
    return assertUsersGroupsWithPatternInAutocompleteListExcluding(
      pattern,
      alreadySharedGroup,
      'group'
    )
  }
)

Then(
  'only users and groups that contain the string {string} in their name or displayname should be listed in the autocomplete list on the webUI',
  async function (pattern) {
    const createdUsers = await userSettings.getCreatedUsers()
    const createdGroups = await userSettings.getCreatedGroups()

    console.log(createdUsers, createdGroups)
    return client.page.FilesPageElement.sharingDialog()
      .getShareAutocompleteItemsList()
      .then((itemsList) => {
        itemsList.forEach((item) => {
          const displayedName = item.split('\n')[0]
          let found = false
          for (const userId in createdUsers) {
            const userDisplayName = createdUsers[userId].displayname
            if (
              userDisplayName === displayedName &&
              (userDisplayName.toLowerCase().includes(pattern) ||
                userId.toLowerCase().includes(pattern))
            ) {
              found = true
            }
          }
          createdGroups.forEach(function (groupId) {
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
  }
)

Then(
  'every item listed in the autocomplete list on the webUI should contain {string}',
  function (pattern) {
    return client.page.FilesPageElement.sharingDialog()
      .getShareAutocompleteItemsList()
      .then((itemsList) => {
        itemsList.forEach((item) => {
          if (!item.toLowerCase().includes(pattern)) {
            assert.fail(`sharee ${item} does not contain pattern ${pattern}`)
          }
        })
      })
  }
)

Then(
  'the users own name should not be listed in the autocomplete list on the webUI',
  async function () {
    const currentUserDisplayName = await userSettings.getDisplayNameForUser(
      client.globals.currentUser
    )
    return client.page.FilesPageElement.sharingDialog()
      .getShareAutocompleteItemsList()
      .then((itemsList) => {
        itemsList.forEach((item) => {
          const displayedName = item.split('\n')[0]
          assert.notStrictEqual(
            displayedName,
            currentUserDisplayName,
            `Users own name: ${currentUserDisplayName} was not expected to be listed in the autocomplete list but was`
          )
        })
      })
  }
)

Then(
  '{string} {string} should not be listed in the autocomplete list on the webUI',
  function (type, displayName) {
    return client.page.FilesPageElement.sharingDialog().assertCollaboratorsInAutocompleteList(
      displayName,
      type,
      false
    )
  }
)

Then(
  '{string} {string} should be listed in the autocomplete list on the webUI',
  function (type, displayName) {
    return client.page.FilesPageElement.sharingDialog().assertCollaboratorsInAutocompleteList(
      displayName,
      type
    )
  }
)

Then(
  'the share permission denied message should be displayed in the sharing dialog on the webUI',
  function () {
    return client.page.FilesPageElement.sharingDialog().isSharePermissionMessageVisible()
  }
)

Then(
  'the link share permission denied message should be displayed in the sharing dialog on the webUI',
  function () {
    return client.page.FilesPageElement.sharingDialog().isLinkSharePermissionMessageVisible()
  }
)

When(
  'the user opens the share dialog for file/folder/resource {string} using the webUI',
  function (file) {
    return client.page.FilesPageElement.filesList().openSharingDialog(file)
  }
)

When(
  'the user opens the link share dialog for file/folder/resource {string} using the webUI',
  function (file) {
    return client.page.FilesPageElement.filesList().openPublicLinkDialog(file)
  }
)

When(
  'the user deletes {string} as collaborator for the current file/folder using the webUI',
  function (user) {
    return client.page.FilesPageElement.SharingDialog.collaboratorsDialog().deleteShareWithUserGroup(
      user
    )
  }
)

When(
  'the user deletes {string} as remote collaborator for the current file/folder using the webUI',
  function (user) {
    user = util.format('%s@%s', user, client.globals.remote_backend_url)
    return client.page.FilesPageElement.SharingDialog.collaboratorsDialog().deleteShareWithUserGroup(
      user
    )
  }
)

When(
  'the user changes the collaborator role of {string} for file/folder {string} to {string} with permissions {string} using the webUI',
  async function (collaborator, resource, newRole, permissions) {
    const api = client.page.FilesPageElement
    await api.filesList().openSharingDialog(resource)
    return api.sharingDialog().changeCollaboratorRole(collaborator, newRole, permissions)
  }
)

When(
  'the user (tries to )edit/edits the collaborator expiry date of {string} of file/folder/resource {string} to {string} days/day using the webUI',
  async function (collaborator, resource, days) {
    const api = client.page.FilesPageElement
    await api.filesList().openSharingDialog(resource)
    return api.sharingDialog().changeCollaboratorExpiryDate(collaborator, days)
  }
)

Then(
  'user {string} should be listed as {string} in the collaborators list on the webUI',
  function (user, role) {
    return assertCollaboratorslistContains('user', user, { role })
  }
)

Then(
  'the share {string} shared with user {string} should have no expiration information displayed on the webUI',
  async function (item, user) {
    await client.page.FilesPageElement.filesList().openSharingDialog(item)
    const elementID =
      await client.page.FilesPageElement.SharingDialog.collaboratorsDialog().getCollaboratorExpirationInfo(
        user
      )
    return assert.strictEqual(
      elementID,
      undefined,
      'The expiration information was present unexpectedly'
    )
  }
)

Then(
  'the expiration information displayed on the webUI of share {string} shared with user {string} should be {string} or {string}',
  async function (item, user, information1, information2) {
    await client.page.FilesPageElement.filesList().openSharingDialog(item)
    const actualInfo =
      await client.page.FilesPageElement.SharingDialog.collaboratorsDialog().getCollaboratorExpirationInfo(
        user
      )
    if (actualInfo === information1) {
      return true
    } else {
      return assert.strictEqual(
        actualInfo,
        information2,
        `The expected expiration information was either '${information1}' or '${information2}', but got '${actualInfo}'`
      )
    }
  }
)

Then(
  'user {string} should be listed as {string} reshared through {string} in the collaborators list on the webUI',
  function (user, role, resharedThrough) {
    return assertCollaboratorslistContains('user', user, { role, resharedThrough })
  }
)

Then(
  'user {string} should be listed with additional info {string} in the collaborators list on the webUI',
  function (user, additionalInfo) {
    return assertCollaboratorslistContains('user', user, { additionalInfo })
  }
)

Then(
  'user {string} should be listed without additional info in the collaborators list on the webUI',
  function (user) {
    return assertCollaboratorslistContains('user', user, { additionalInfo: false })
  }
)

Then(
  'user {string} should be listed as {string} in the collaborators list for file/folder/resource {string} on the webUI',
  async function (user, role, resource) {
    await client.page.FilesPageElement.filesList().openSharingDialog(resource)
    return assertCollaboratorslistContains('user', user, { role })
  }
)

Then(
  'group {string} should be listed as {string} in the collaborators list on the webUI',
  function (group, role) {
    return assertCollaboratorslistContains('group', group, { role })
  }
)

Then(
  'group {string} should be listed as {string} in the collaborators list for file/folder/resource {string} on the webUI',
  async function (group, role, resource) {
    await client.page.FilesPageElement.filesList().openSharingDialog(resource)
    return assertCollaboratorslistContains('group', group, { role })
  }
)

Then('user {string} should not be listed in the collaborators list on the webUI', function (user) {
  return assertCollaboratorslistDoesNotContain('user', user)
})

Then(
  'group {string} should not be listed in the collaborators list on the webUI',
  function (group) {
    return assertCollaboratorslistDoesNotContain('group', group)
  }
)

Then(
  'the user should not be able to share file/folder/resource {string} using the webUI',
  async function (resource) {
    const api = client.page.FilesPageElement
    await api.filesList().openSharingDialog(resource)
    return await api.sharingDialog().isSharePermissionMessageVisible()
  }
)

Then(
  'the collaborators list for file/folder/resource {string} should be empty',
  async function (resource) {
    const api = client.page.FilesPageElement
    await api.filesList().openSharingDialog(resource)

    const visible = await api.SharingDialog.collaboratorsDialog().hasCollaboratorsList(false)
    assert.strictEqual(visible, false, 'Expected collaborators list to not exist, but it did')
  }
)

Then('the expiration date field should be marked as required on the webUI', async function () {
  await client.page.FilesPageElement.sharingDialog().waitForElementVisible(
    '@requiredLabelInCollaboratorsExpirationDate'
  )
})

Then(
  'the expiration date for {string} should be disabled on the webUI',
  async function (expiration) {
    const dateToSet = calculateDate(expiration)
    const isEnabled = await client.page.FilesPageElement.sharingDialog()
      .openExpirationDatePicker()
      .setExpirationDate(dateToSet)
    return assert.strictEqual(
      isEnabled,
      false,
      `The expiration date for ${expiration} was expected to be disabled, but is found enabled`
    )
  }
)

Then('the current collaborators list should have order {string}', async function (expectedNames) {
  const actualNames = (
    await client.page.FilesPageElement.SharingDialog.collaboratorsDialog().getCollaboratorsListNames()
  ).join(',')
  assert.strictEqual(
    actualNames,
    expectedNames,
    `Expected to have collaborators in order '${expectedNames}', Found: ${actualNames}`
  )
})

Then(
  'file/folder {string} shared by {string} should be in {string} state on the webUI',
  async function (resource, sharer, expectedStatus) {
    const shareStatus =
      expectedStatus === 'Accepted'
        ? SHARE_STATE.accepted
        : expectedStatus === 'Declined'
        ? SHARE_STATE.declined
        : SHARE_STATE.pending
    const hasShareStatus = await client.page
      .sharedWithMePage()
      .hasShareStatusByFilenameAndUser(shareStatus, resource, sharer)
    return assert.ok(
      hasShareStatus,
      `Expected resource '${resource}' shared by '${sharer}' to be in state '${expectedStatus}' but isn't.`
    )
  }
)

When(
  'the user declines share {string} offered by user {string} using the webUI',
  async function (filename, user) {
    await client.pause(200)
    return client.page.sharedWithMePage().declineAcceptFile('Decline', filename, user)
  }
)

When(
  'the user accepts share {string} offered by user {string} using the webUI',
  async function (filename, user) {
    await client.pause(200)
    return client.page.sharedWithMePage().declineAcceptFile('Accept', filename, user)
  }
)

Then('the autocomplete list should not be displayed on the webUI', async function () {
  const isVisible = await client.page.FilesPageElement.sharingDialog().isAutocompleteListVisible()
  return assert.ok(!isVisible, 'Expected: autocomplete list "not visible" but found "visible"')
})

Then(
  'file/folder {string} should be marked as shared by {string} on the webUI',
  async function (element, sharer) {
    const username = await client.page.sharedWithMePage().getSharedByUser(element)
    return assert.strictEqual(
      username,
      sharer,
      `Expected username: '${sharer}', but found '${username}'`
    )
  }
)

Then('the following resources should have the following collaborators', async function (dataTable) {
  for (const { fileName, expectedCollaborators } of dataTable.hashes()) {
    const collaboratorsArray = await client.page
      .sharedWithOthersPage()
      .getCollaboratorsForResource(fileName)

    const expectedCollaboratorsArray = expectedCollaborators.split(',').map((s) => s.trim())
    assert.ok(
      _.intersection(collaboratorsArray, expectedCollaboratorsArray).length ===
        expectedCollaboratorsArray.length,
      `Expected collaborators to be the same for "${fileName}": expected [` +
        expectedCollaboratorsArray.join(', ') +
        '] got [' +
        collaboratorsArray.join(', ') +
        ']'
    )
  }
})

When(
  'the user (tries to )share/shares file/folder/resource {string} with user {string} which expires in {string} day/days using the webUI',
  function (resource, sharee, days) {
    return userSharesFileOrFolderWithUserOrGroupWithExpirationDate({ resource, sharee, days })
  }
)

When(
  'the user (tries to )share/shares file/folder/resource {string} with group {string} which expires in {string} day/days using the webUI',
  function (resource, sharee, days) {
    return userSharesFileOrFolderWithUserOrGroupWithExpirationDate({
      resource,
      sharee,
      days,
      shareWithGroup: true
    })
  }
)

When('the user opens the sharing sidebar for file/folder {string}', function (file) {
  return client.page.FilesPageElement.filesList().openSideBar(file)
})

When(
  'the user shares file/folder/resource {string} with user {string} using the webUI',
  function (resource, user) {
    return userSharesFileOrFolderWithUser(resource, user, 'Viewer')
  }
)

Then(
  'the fields of the {string} collaborator for file/folder/resource {string} should contain expiration date with value {string} on the webUI',
  function (collaborator, resource, value) {
    return checkCollaboratorsExpirationDate(collaborator, resource, value)
  }
)

Then(
  'the share expiration date shown on the webUI should be {string} days',
  async function (expectedDays) {
    const expectedDate = sharingHelper.calculateDate(expectedDays)
    const expectedDateString = expectedDate.toString()
    const dateStringFromInputField =
      await client.page.FilesPageElement.sharingDialog().getExpirationDateFromInputField()
    assert.strictEqual(
      dateStringFromInputField,
      expectedDateString,
      `Expected: Expiration date field with ${expectedDateString}, but found ${dateStringFromInputField}`
    )
  }
)

When(
  'the user shares resource {string} with user {string} using the quick action on the webUI',
  function (resource, user) {
    return userSharesFileOrFolderWithUserOrGroup(
      resource,
      user,
      false,
      'Viewer',
      undefined,
      false,
      true
    )
  }
)
