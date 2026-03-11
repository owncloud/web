import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

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
      actionType: 'SIDEBAR_PANEL',
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
    await ui.userOpensResources({
      world,
      stepUser: 'Brian',
      resource: 'folder_to_shared'
    })
    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource  |
    //   | lorem.txt |
    // user should have access to unsynced shares
    await ui.userShouldSeeTheResources({
      world,
      listType: 'files list',
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
      actionType: 'SIDEBAR_PANEL',
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
    await ui.userRemovesSharee({
      world,
      stepUser: 'Alice',
      resource: 'folder_to_shared_2',
      recipient: 'Brian'
    })

    // When "Alice" deletes the following resources using the sidebar panel
    //   | resource         | from             |
    //   | lorem_new.txt    | folder_to_shared |
    //   | folder_to_shared |                  |
    await ui.userDeletesResources({
      world,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
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
})
