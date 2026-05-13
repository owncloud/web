import { test } from '../../environment/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { fileAction, resourcePage, shareIndicator } from '../../environment/constants'

test.describe('share', () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })
  })

  test('folder', { tag: '@predefined-users' }, async ({ world }) => {
    // Given "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    // And "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    // And "Alice" creates the following folder in personal space using API
    //   | name               |
    //   | folder_to_shared   |
    //   | folder_to_shared_2 |
    //   | shared_folder      |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['folder_to_shared', 'folder_to_shared_2', 'shared_folder']
    })
    // When "Alice" shares the following resource using the sidebar panel
    //   | resource           | recipient | type | role                   | resourceType |
    //   | folder_to_shared   | Brian     | user | Can edit with trashbin | folder       |
    //   | shared_folder      | Brian     | user | Can edit with trashbin | folder       |
    //   | folder_to_shared_2 | Brian     | user | Can edit with trashbin | folder       |
    await ui.userSharesResources({
      world,
      actionType: fileAction.sideBarPanel,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'folder_to_shared',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'shared_folder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'folder_to_shared_2',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        }
      ]
    })
    // And "Alice" uploads the following resource
    // | resource      | to                 |
    // | lorem.txt     | folder_to_shared   |
    // | lorem-big.txt | folder_to_shared_2 |
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [
        { name: 'lorem.txt', to: 'folder_to_shared' },
        { name: 'lorem-big.txt', to: 'folder_to_shared_2' }
      ]
    })
    // And "Brian" navigates to the shared with me page
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    // And "Brian" opens folder "folder_to_shared"
    await ui.userOpensResource({
      world,
      stepUser: 'Brian',
      resource: 'folder_to_shared'
    })
    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource  |
    //   | lorem.txt |
    // user should have access to unsynced shares
    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.filesList,
      stepUser: 'Brian',
      resources: ['lorem.txt']
    })
    // When "Brian" navigates to the shared with me page
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    // And "Brian" disables the sync for the following shares
    //   | name               |
    //   | folder_to_shared   |
    //   | folder_to_shared_2 |
    await ui.userDisablesSyncForShares({
      world,
      stepUser: 'Brian',
      shares: ['folder_to_shared', 'folder_to_shared_2']
    })
    // Then "Brian" should not see a sync status for the folder "folder_to_shared"
    // And "Brian" should not see a sync status for the folder "folder_to_shared_2"
    await ui.sharesShouldNotHaveSyncStatus({
      world,
      stepUser: 'Brian',
      shares: ['folder_to_shared', 'folder_to_shared_2']
    })
    // When "Brian" enables the sync for the following share using the context menu
    //   | name               |
    //   | folder_to_shared   |
    //   | folder_to_shared_2 |
    await ui.userEnablesSyncForShares({
      world,
      stepUser: 'Brian',
      shares: ['folder_to_shared', 'folder_to_shared_2']
    })

    // Then "Brian" should see a sync status for the folder "folder_to_shared"
    // And "Brian" should see a sync status for the folder "folder_to_shared_2"
    await ui.sharesShouldHaveSyncStatus({
      world,
      stepUser: 'Brian',
      shares: ['folder_to_shared', 'folder_to_shared_2']
    })

    // When "Brian" renames the following resource
    //   | resource                   | as            |
    //   | folder_to_shared/lorem.txt | lorem_new.txt |
    await ui.userRenamesResource({
      world,
      stepUser: 'Brian',
      resource: 'folder_to_shared/lorem.txt',
      newResourceName: 'lorem_new.txt'
    })
    // And "Brian" uploads the following resource
    //   | resource        | to                 |
    //   | simple.pdf      | folder_to_shared   |
    //   | testavatar.jpeg | folder_to_shared_2 |
    await ui.userUploadsResources({
      world,
      stepUser: 'Brian',
      resources: [
        { name: 'simple.pdf', to: 'folder_to_shared' },
        { name: 'testavatar.jpeg', to: 'folder_to_shared_2' }
      ]
    })

    // When "Brian" deletes the following resources using the sidebar panel
    //   | resource      | from               |
    //   | lorem-big.txt | folder_to_shared_2 |
    await ui.userDeletesResources({
      world,
      stepUser: 'Brian',
      actionType: fileAction.sideBarPanel,
      resources: [{ name: 'lorem-big.txt', from: 'folder_to_shared_2' }]
    })

    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })
    // And "Alice" uploads the following resource
    //   | resource          | to               | option  |
    //   | PARENT/simple.pdf | folder_to_shared | replace |
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'simple.pdf', to: 'folder_to_shared', option: 'replace' }]
    })
    // And "Brian" should not see the version panel for the file
    //   | resource   | to               |
    //   | simple.pdf | folder_to_shared |
    await ui.userShouldNotSeeVersionPanelForFiles({
      world,
      stepUser: 'Brian',
      file: 'simple.pdf',
      to: 'folder_to_shared'
    })
    // And "Alice" removes following sharee
    //   | resource           | recipient |
    //   | folder_to_shared_2 | Brian     |
    await ui.userRemovesSharees({
      world,
      stepUser: 'Alice',
      sharees: [
        {
          resource: 'folder_to_shared_2',
          recipient: 'Brian'
        }
      ]
    })

    // When "Alice" deletes the following resources using the sidebar panel
    //   | resource         | from             |
    //   | lorem_new.txt    | folder_to_shared |
    //   | folder_to_shared |                  |
    await ui.userDeletesResources({
      world,
      stepUser: 'Alice',
      actionType: fileAction.sideBarPanel,
      resources: [{ name: 'lorem_new.txt', from: 'folder_to_shared' }, { name: 'folder_to_shared' }]
    })

    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
    // Then "Brian" should not be able to see the following shares
    //   | resource           | owner                    |
    //   | folder_to_shared_2 | %user_alice_displayName% |
    //   | folder_to_shared   | %user_alice_displayName% |
    await ui.userShouldNotSeeShare({
      world,
      stepUser: 'Brian',
      resource: 'folder_to_shared_2',
      owner: '%user_alice_displayName%'
    })

    await ui.userShouldNotSeeShare({
      world,
      stepUser: 'Brian',
      resource: 'folder_to_shared',
      owner: '%user_alice_displayName%'
    })
    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })
  })

  test('share with expiration date', async ({ world }) => {
    //    Given "Admin" creates following group using API
    //   | id    |
    //   | sales |
    await api.groupsHaveBeenCreated({
      world,
      groupIds: ['sales'],
      stepUser: 'Admin'
    })
    // And "Admin" adds user to the group using API
    //   | user  | group |
    //   | Brian | sales |
    await api.usersHaveBeenAddedToGroup({
      world,
      stepUser: 'Admin',
      usersToAdd: [{ user: 'Brian', group: 'sales' }]
    })

    // And "Alice" creates the following folder in personal space using API
    //   | name       |
    //   | myfolder   |
    //   | mainFolder |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['myfolder', 'mainFolder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile           | content      |
    //   | new.txt              | some content |
    //   | mainFolder/lorem.txt | lorem epsum  |
    await api.userHasCreatedFiles({
      world,
      stepUser: 'Alice',
      files: [
        { pathToFile: 'new.txt', content: 'some content' },
        { pathToFile: 'mainFolder/lorem.txt', content: 'lorem epsum' }
      ]
    })
    // And "Alice" logs In
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    // When "Alice" shares the following resource using the sidebar panel
    //   | resource   | recipient | type  | role                      | resourceType | expirationDate |
    //   | new.txt    | Brian     | user  | Can edit with trashbin    | file         | +5 days        |
    //   | myfolder   | sales     | group | Can view                  | folder       | +10 days       |
    //   | mainFolder | Brian     | user  | Can edit with trashbin    | folder       |                |
    await ui.userSharesResources({
      world,
      stepUser: 'Alice',
      actionType: fileAction.sideBarPanel,
      shares: [
        {
          resource: 'new.txt',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'file',
          expirationDate: '+5 days'
        },
        {
          resource: 'myfolder',
          recipient: 'sales',
          type: 'group',
          role: 'Can view',
          resourceType: 'folder',
          expirationDate: '+10 days'
        },
        {
          resource: 'mainFolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        }
      ]
    })

    // set expirationDate to existing share
    // And "Alice" sets the expiration date of share "mainFolder" of user "Brian" to "+5 days"
    await ui.userSetsExpirationDateOfShare({
      world,
      stepUser: 'Alice',
      resource: 'mainFolder',
      collaboratorName: 'Brian',
      collaboratorType: 'user',
      expirationDate: '+5 days'
    })

    // And "Alice" checks the following access details of share "mainFolder" for user "Brian"
    //   | Name | Brian Murphy |
    //   | Type | User         |
    await ui.userChecksAccessDetailsOfShare({
      world,
      stepUser: 'Alice',
      resource: 'mainFolder',
      sharee: { name: 'Brian', type: 'user' },
      accessDetails: {
        Name: 'Brian Murphy',
        Type: 'User'
      }
    })

    // And "Alice" checks the following access details of share "mainFolder/lorem.txt" for user "Brian"
    //   | Name | Brian Murphy |
    //   | Type | User         |
    await ui.userChecksAccessDetailsOfShare({
      world,
      stepUser: 'Alice',
      resource: 'mainFolder/lorem.txt',
      sharee: { name: 'Brian', type: 'user' },
      accessDetails: {
        Name: 'Brian Murphy',
        Type: 'User'
      }
    })
    // And "Alice" sets the expiration date of share "myfolder" of group "sales" to "+3 days"
    await ui.userSetsExpirationDateOfShare({
      world,
      stepUser: 'Alice',
      resource: 'myfolder',
      collaboratorName: 'sales',
      collaboratorType: 'group',
      expirationDate: '+3 days'
    })
    // And "Alice" checks the following access details of share "myfolder" for group "sales"
    //   | Name | sales department |
    //   | Type | Group            |
    await ui.userChecksAccessDetailsOfShare({
      world,
      stepUser: 'Alice',
      resource: 'myfolder',
      sharee: { name: 'sales', type: 'group' },
      accessDetails: {
        Name: 'sales department',
        Type: 'Group'
      }
    })
    // remove share with group
    // When "Alice" removes following sharee
    //   | resource | recipient | type  |
    //   | myfolder | sales     | group |
    await ui.userRemovesSharees({
      world,
      stepUser: 'Alice',
      sharees: [
        {
          resource: 'myfolder',
          recipient: 'sales',
          type: 'group'
        }
      ]
    })
    // And  "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })

  test('receive two shares with same name', async ({ world }) => {
    //    Given "Admin" creates following users using API
    //   | id    |
    //   | Carol |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Carol']
    })
    // And "Alice" creates the following folder in personal space using API
    //   | name        |
    //   | test-folder |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['test-folder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile   | content      |
    //   | testfile.txt | example text |
    await api.userHasCreatedFiles({
      world,
      stepUser: 'Alice',
      files: [
        {
          pathToFile: 'testfile.txt',
          content: 'example text'
        }
      ]
    })
    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    // And "Alice" shares the following resource using the sidebar panel
    //   | resource     | recipient | type | role     |
    //   | testfile.txt | Brian     | user | Can view |
    //   | test-folder  | Brian     | user | Can view |
    await ui.userSharesResources({
      world,
      stepUser: 'Alice',
      actionType: fileAction.sideBarPanel,
      shares: [
        {
          resource: 'testfile.txt',
          recipient: 'Brian',
          type: 'user',
          role: 'Can view',
          resourceType: 'file'
        },
        {
          resource: 'test-folder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can view',
          resourceType: 'folder'
        }
      ]
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
    // And "Carol" creates the following folder in personal space using API
    //   | name        |
    //   | test-folder |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Carol',
      folderNames: ['test-folder']
    })
    // And "Carol" creates the following files into personal space using API
    //   | pathToFile   | content      |
    //   | testfile.txt | example text |
    await api.userHasCreatedFiles({
      world,
      stepUser: 'Carol',
      files: [
        {
          pathToFile: 'testfile.txt',
          content: 'example text'
        }
      ]
    })
    // And "Carol" logs in
    await ui.userLogsIn({ world, stepUser: 'Carol' })
    // And "Carol" shares the following resource using the sidebar panel
    //   | resource     | recipient | type | role     |
    //   | testfile.txt | Brian     | user | Can view |
    //   | test-folder  | Brian     | user | Can view |
    await ui.userSharesResources({
      world,
      stepUser: 'Carol',
      actionType: fileAction.sideBarPanel,
      shares: [
        {
          resource: 'testfile.txt',
          recipient: 'Brian',
          type: 'user',
          role: 'Can view',
          resourceType: 'file'
        },
        {
          resource: 'test-folder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can view',
          resourceType: 'folder'
        }
      ]
    })
    // And "Carol" logs out
    await ui.userLogsOut({ world, stepUser: 'Carol' })
    // When "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    // And "Brian" navigates to the shared with me page
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    // Then following resources should be displayed in the Shares for user "Brian"
    //   | resource         |
    //   | testfile.txt     |
    //   | test-folder      |
    //   # https://github.com/owncloud/ocis/issues/8471
    //   | testfile (1).txt |
    //   | test-folder (1)  |
    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.shares,
      stepUser: 'Brian',
      resources: ['testfile.txt', 'test-folder', 'testfile (1).txt', 'test-folder (1)']
    })
    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })
  })

  test('check file with same name but different paths are displayed correctly in shared with others page', async ({
    world
  }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Carol |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Carol']
    })
    // And "Alice" creates the following folder in personal space using API
    //   | name        |
    //   | test-folder |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['test-folder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile               | content      |
    //   | testfile.txt             | example text |
    //   | test-folder/testfile.txt | some text    |
    await api.userHasCreatedFiles({
      world,
      stepUser: 'Alice',
      files: [
        {
          pathToFile: 'testfile.txt',
          content: 'example text'
        },
        {
          pathToFile: 'test-folder/testfile.txt',
          content: 'some text'
        }
      ]
    })
    // And "Alice" shares the following resource using API
    //   | resource                 | recipient | type | role                      |
    //   | testfile.txt             | Brian     | user | Can edit with trashbin    |
    //   | test-folder/testfile.txt | Brian     | user | Can edit with trashbin    |
    await api.userHasSharedResources({
      world,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'testfile.txt',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'file'
        },
        {
          resource: 'test-folder/testfile.txt',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'file'
        }
      ]
    })
    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    // And "Alice" navigates to the shared with others page
    await ui.userNavigatesToSharedWithOthersPage({ world, stepUser: 'Alice' })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource                 |
    //   | testfile.txt             |
    //   | test-folder/testfile.txt |
    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.filesList,
      stepUser: 'Alice',
      resources: ['testfile.txt', 'test-folder/testfile.txt']
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })

  test('share indication', async ({ world }) => {
    //  When "Alice" creates the following folders in personal space using API
    //   | name                  |
    //   | shareFolder/subFolder |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['shareFolder/subFolder']
    })
    // And "Alice" shares the following resource using API
    //   | resource    | recipient | type | role                   | resourceType |
    //   | shareFolder | Brian     | user | Can edit with trashbin | folder       |
    await api.userHasSharedResources({
      world,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'shareFolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        }
      ]
    })
    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    // Then "Alice" should see user-direct indicator on the folder "shareFolder"
    await ui.userShouldSeeShareIndicatorOnResource({
      world,
      stepUser: 'Alice',
      buttonLabel: shareIndicator.userDirect,
      resource: 'shareFolder'
    })
    // When "Alice" opens folder "shareFolder"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: 'shareFolder'
    })
    // Then "Alice" should see user-indirect indicator on the folder "subFolder"
    await ui.userShouldSeeShareIndicatorOnResource({
      world,
      stepUser: 'Alice',
      buttonLabel: shareIndicator.userIndirect,
      resource: 'subFolder'
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
