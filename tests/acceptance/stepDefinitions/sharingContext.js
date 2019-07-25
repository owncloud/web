const { client } = require('nightwatch-api')
const { When, Given, Then } = require('cucumber')
const fetch = require('node-fetch')
const assert = require('assert')
const { URLSearchParams } = require('url')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const userSettings = require('../helpers/userSettings')

/**
 *
 * @param {string} file
 * @param {string} sharee
 * @param {boolean} shareWithGroup
 * @param {string} role
 */
const userSharesFileOrFolderWithUserOrGroup = function (file, sharee, shareWithGroup, role) {
  return client.page
    .FilesPageElement
    .sharingDialog()
    .closeSharingDialog()
    .openSharingDialog(file)
    .shareWithUserOrGroup(sharee, shareWithGroup, role)
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
const userSharesFileOrFolderWithGroup = function (file, sharee, role) {
  return userSharesFileOrFolderWithUserOrGroup(file, sharee, true, role)
}

/**
 *
 * @param {string} elementToShare  path of file/folder being shared
 * @param {string} sharer  username of the sharer
 * @param {string} receiver  username of the reciever
 * @param {number} shareType  Type of share 0 = user, 1 = group, 3 = public (link), 6 = federated (cloud share).
 * @param {number} permissions  permissions of the share  1 = read; 2 = update; 4 = create;
 *                                                    8 = delete; 16 = share; 31 = all
 *                                                    15 = change
 *                                                    5 = uploadwriteonly
 *                                                    (default: 31)
 */
const shareFileFolder = function (elementToShare, sharer, receiver, shareType = 0, permissions = 31) {
  const params = new URLSearchParams()
  params.append('shareType', shareType)
  params.append('shareWith', receiver)
  params.append('path', elementToShare)
  params.append('permissions', permissions)
  return fetch(
    client.globals.backend_url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json',
    { method: 'POST', headers: httpHelper.createAuthHeader(sharer), body: params }
  )
    .then(res => res.json())
    .then(function (json) {
      if (json.ocs.meta.statuscode === 200) {
        return json
      } else {
        throw Error('Could not create share. Message: ' + json.ocs.meta.message)
      }
    })
}

/**
 *
 * @param {string} type user|group
 * @param {string} name
 * @param {string} role
 * @returns {Promise}
 */
const assertCollaboratorslistContains = function (type, name, role) {
  return client.page.FilesPageElement.sharingDialog().getCollaboratorsList()
    .then(shares => {
      let expectedString = name + '\n' + role
      if (type === 'user') {
        expectedString = expectedString + client.page.FilesPageElement.sharingDialog().getUserSharePostfix()
      } else if (type === 'group') {
        expectedString = expectedString + client.page.FilesPageElement.sharingDialog().getGroupSharePostfix()
      } else {
        throw new Error('illegal type')
      }

      if (!shares || !shares.includes(expectedString)) {
        assert.fail(
          `"${name}" was expected to be in share list but was not present. Found collaborators text:"` + shares + `"`
        )
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
  return client.page.FilesPageElement.sharingDialog().getCollaboratorsList()
    .then(shares => {
      if (shares) {
        var searchregex
        if (type === 'user') {
          searchregex = new RegExp(name + '\n.*' + client.page.FilesPageElement.sharingDialog().getUserSharePostfix())
        } else if (type === 'group') {
          searchregex = new RegExp(name + '\n.*' + client.page.FilesPageElement.sharingDialog().getGroupSharePostfix())
        } else {
          throw new Error('illegal type')
        }
        shares.map(share => {
          assert.strictEqual(
            searchregex.test(share),
            false,
            `"${name}" not expected to be in the share list but is present`
          )
        })
      }
    })
}

Given('user {string} has shared file/folder {string} with user {string}', function (sharer, elementToShare, receiver) {
  return shareFileFolder(elementToShare, sharer, receiver)
})

Given('user {string} has shared file/folder {string} with group {string}', function (sharer, elementToShare, receiver) {
  return shareFileFolder(elementToShare, sharer, receiver, 1)
})

When('the user types {string} in the share-with-field', function (input) {
  return client.page.FilesPageElement.sharingDialog().enterAutoComplete(input)
})

When('the user shares file/folder {string} with group {string} as {string} using the webUI', userSharesFileOrFolderWithGroup)

When('the user shares file/folder {string} with user {string} as {string} using the webUI', userSharesFileOrFolderWithUser)

Then('all users and groups that contain the string {string} in their name should be listed in the autocomplete list on the webUI', function (pattern) {
  return client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
    .then(itemsList => {
      const currentUserDisplayName = userSettings.getDisplayNameForUser(client.globals.currentUser)

      // check if all created users that contain the pattern either in the display name or the username
      // are listed in the autocomplete list
      // in both cases the display name should be listed
      for (var userId in userSettings.getCreatedUsers()) {
        const userDisplayName = userSettings.getDisplayNameForUser(userId)
        if ((userDisplayName.toLowerCase().includes(pattern) ||
          userId.includes(pattern)) &&
          userDisplayName !== currentUserDisplayName) {
          const userString = userDisplayName + client.page.FilesPageElement.sharingDialog().getUserSharePostfix()

          assert.ok(
            itemsList.includes(userString),
            `could not find '${userDisplayName}' in autocomple share list`
          )
        }
      }

      // check if every created group that contains the pattern is listed in the autocomplete list
      userSettings.getCreatedGroups().forEach(function (groupId) {
        if (groupId.toLowerCase().includes(pattern)) {
          const groupString = groupId + client.page.FilesPageElement.sharingDialog().getGroupSharePostfix()

          assert.ok(
            itemsList.includes(groupString),
            `could not find '${groupString}' in autocomple share list`
          )
        }
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
        assert.notStrictEqual(
          item,
          currentUserDisplayName,
          `Users own name: ${currentUserDisplayName} was not expected to be listed in the autocomplete list but was`
        )
      })
    })
})

Then('user {string} should not be listed in the autocomplete list on the webUI', function (displayName) {
  return client.page.FilesPageElement.sharingDialog().getShareAutocompleteItemsList()
    .then(itemsList => {
      itemsList.forEach(item => {
        assert.notStrictEqual(
          item,
          displayName,
          `Users own name: ${displayName} was not expected to be listed in the autocomplete list but was`
        )
      })
    })
})

When('the user opens the share dialog for file {string} using the webUI', function (file) {
  return client.page.FilesPageElement.filesList().openSharingDialog(file)
})

When('the user deletes {string} as collaborator for the current file/folder using the webUI', function (user) {
  return client.page.FilesPageElement.sharingDialog().deleteShareWithUserGroup(user)
})

Then('user {string} should be listed as {string} in the collaborators list on the webUI', function (user, role) {
  return assertCollaboratorslistContains('user', user, role)
})

Then('group {string} should be listed as {string} in the collaborators list on the webUI', function (group, role) {
  return assertCollaboratorslistContains('group', group, role)
})

Then('user {string} should not be listed in the collaborators list on the webUI', function (user) {
  return assertCollaboratorslistDoesNotContain('user', user)
})

Then('group {string} should not be listed in the collaborators list on the webUI', function (user) {
  return assertCollaboratorslistDoesNotContain('group', user)
})
