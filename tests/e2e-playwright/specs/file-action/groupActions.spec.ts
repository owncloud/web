import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('Group actions', { tag: '@predefined-users' }, () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()

  test.beforeEach(async ({ browser }) => {
    actorsEnvironment = new ActorsEnvironment({
      context: {
        acceptDownloads: config.acceptDownloads,
        reportDir: config.reportDir,
        tracingReportDir: config.tracingReportDir,
        reportHar: config.reportHar,
        reportTracing: config.reportTracing,
        reportVideo: config.reportVideo,
        failOnUncaughtConsoleError: config.failOnUncaughtConsoleError
      },
      browser: browser
    })

    await setAccessAndRefreshToken(usersEnvironment)

    // Given "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    //   | Carol |
    //   | David |
    //   | Edith |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian', 'Carol', 'David', 'Edith']
    })
    // And "Admin" creates following group using API
    //   | id       |
    //   | sales    |
    //   | finance  |
    //   | security |
    await api.groupsHaveBeenCreated({
      groupIds: ['sales', 'finance', 'security'],
      admin: usersEnvironment.getUser({ key: 'Admin' })
    })
    // And "Admin" adds user to the group using API
    //   | user  | group    |
    //   | Brian | sales    |
    //   | Brian | finance  |
    //   | Brian | security |
    await api.addUserToGroup({
      usersEnvironment,
      stepUser: 'Admin',
      userToAdd: [
        { user: 'Brian', group: 'sales' },
        { user: 'Brian', group: 'finance' },
        { user: 'Brian', group: 'security' }
      ]
    })
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'David' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Edith' })
  })

  test('batch share a resource to multiple users and groups', async () => {
    // disabling auto accepting to check accepting share
    // And "Brian" disables auto-accepting using API
    await api.userHasDisabledAutoAcceptingShare({ usersEnvironment, stepUser: 'Brian' })

    // And "Alice" creates the following folders in personal space using API
    //   | name                   |
    //   | sharedFolder           |
    //   | folder1                |
    //   | folder2                |
    //   | folder3                |
    //   | folder4                |
    //   | folder5                |
    //   | parentFolder/SubFolder |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: [
        'sharedFolder',
        'folder1',
        'folder2',
        'folder3',
        'folder4',
        'folder5',
        'parentFolder/SubFolder'
      ]
    })
    //  And "Alice" shares the following resource using API
    // | resource     | recipient | type | role                   | resourceType |
    // | folder1      | Brian     | user | Can edit with trashbin | folder       |
    // | folder2      | Brian     | user | Can edit with trashbin | folder       |
    // | folder3      | Brian     | user | Can edit with trashbin | folder       |
    // | folder4      | Brian     | user | Can edit with trashbin | folder       |
    // | folder5      | Brian     | user | Can edit with trashbin | folder       |
    // | parentFolder | Brian     | user | Can edit with trashbin | folder       |
    await api.userHasSharedResources({
      usersEnvironment,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'folder1',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'folder2',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'folder3',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'folder4',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'folder5',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'parentFolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        }
      ]
    })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // # multiple share
    // And "Alice" shares the following resources using the sidebar panel
    // | resource     | recipient | type  | role                   | resourceType |
    // | sharedFolder | Brian     | user  | Can edit with trashbin | folder       |
    // | sharedFolder | Carol     | user  | Can edit with trashbin | folder       |
    // | sharedFolder | David     | user  | Can edit with trashbin | folder       |
    // | sharedFolder | Edith     | user  | Can edit with trashbin | folder       |
    // | sharedFolder | sales     | group | Can edit with trashbin | folder       |
    // | sharedFolder | finance   | group | Can edit with trashbin | folder       |
    // | sharedFolder | security  | group | Can edit with trashbin | folder       |
    await ui.userSharesResources({
      actorsEnvironment,
      usersEnvironment,
      actionType: 'SIDEBAR_PANEL',
      stepUser: 'Alice',
      shares: [
        {
          resource: 'sharedFolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'sharedFolder',
          recipient: 'Carol',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'sharedFolder',
          recipient: 'David',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'sharedFolder',
          recipient: 'Edith',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'sharedFolder',
          recipient: 'sales',
          type: 'group',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'sharedFolder',
          recipient: 'finance',
          type: 'group',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'sharedFolder',
          recipient: 'security',
          type: 'group',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        }
      ]
    })

    // And "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })

    // And "Brian" enables the sync for all shares using the batch action
    await ui.userEnablesSyncForAllShares({ actorsEnvironment, stepUser: 'Brian' })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })
})
