import { expect } from '@playwright/test'
import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment/index.js'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

// For synchronization-related details, see https://owncloud.dev/services/proxy/#claim-updates
test.describe('groups management', () => {
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
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('keycloak group sync with oCIS', async () => {
    // Given "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })

    // And "Alice" creates the following files into personal space using API
    //   | pathToFile          | content              |
    //   | shareToSales.txt    | Keycloak group share |
    //   | shareToSecurity.txt | Keycloak group share |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'shareToSales.txt',
      content: 'Keycloak group share'
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'shareToSecurity.txt',
      content: 'Keycloak group share'
    })
    // When "Admin" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Admin' })

    // And "Admin" opens the "admin-settings" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })

    // And "Admin" navigates to the groups management page
    await ui.userNavigatesToGroupsManagementPage({ actorsEnvironment, stepUser: 'Admin' })

    // When "Admin" creates the following groups
    //   | id       |
    //   | security |
    //   | sales    |
    await ui.userCreatesGroups({
      actorsEnvironment,
      stepUser: 'Admin',
      groupIds: ['security', 'sales']
    })

    // Then "Admin" should see the following group
    //   | group            |
    //   | security         |
    //   | keycloak sales   |
    //   | keycloak finance |
    expect(
      await ui.checkGroupsPresenceByName({
        actorsEnvironment,
        stepUser: 'Admin',
        expectedGroupIds: ['security', 'keycloak sales', 'keycloak finance']
      })
    ).toBeTruthy()

    // When "Admin" navigates to the users management page
    await ui.userNavigatesToUserManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    // And "Admin" adds the user "Brian" to the groups "security,keycloak sales" using the sidebar panel
    await ui.userAddsUserToGroup({
      actorsEnvironment,
      stepUser: 'Admin',
      action: 'adds',
      groups: ['security', 'keycloak sales'],
      user: 'Brian'
    })

    // And "Admin" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Admin' })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" shares the following resource using the sidebar panel
    //   | resource            | recipient      | type  | role                      | resourceType |
    //   | shareToSales.txt    | keycloak sales | group | Can edit without versions | file         |
    //   | shareToSecurity.txt | security       | group | Can edit without versions | file         |
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resource: 'shareToSales.txt',
      recipient: 'keycloak sales',
      type: 'group',
      role: 'Can edit without versions',
      resourceType: 'file'
    })

    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resource: 'shareToSecurity.txt',
      recipient: 'security',
      type: 'group',
      role: 'Can edit without versions',
      resourceType: 'file'
    })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })

    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })

    // user should have access to unsynced shares
    // When "Brian" opens the following file in texteditor
    //   | resource         |
    //   | shareToSales.txt |
    await ui.userOpensFileInViewer({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'shareToSales.txt',
      actionType: 'texteditor'
    })
    // And "Brian" closes the file viewer
    await ui.userClosesTextEditor({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" edits the following resources
    //   | resource            | content     |
    //   | shareToSecurity.txt | new content |
    await ui.userEditsFile({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'shareToSecurity.txt',
      content: 'new content'
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })

    // When "Admin" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Admin' })

    // And "Admin" opens the "admin-settings" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })

    // And "Admin" navigates to the groups management page
    await ui.userNavigatesToGroupsManagementPage({ actorsEnvironment, stepUser: 'Admin' })

    // Renaming a Keycloak group results in the creation of a new group on the oCIS server (see https://github.com/owncloud/ocis/issues/10445).
    // After renaming a group, it may take up to 5 minutes for the changes to sync, so avoid using the renamed group in the subsequent steps.
    // And "Admin" changes displayName to "a renamed group" for group "keycloak finance" using the sidebar panel
    await ui.userRenamesGroup({
      actorsEnvironment,
      stepUser: 'Admin',
      attribute: 'displayName',
      value: 'a renamed group',
      user: 'keycloak finance'
    })

    // When "Admin" deletes the following group using the context menu
    //   | group |
    //   | sales |
    await ui.userDeletesGroup({
      actorsEnvironment,
      stepUser: 'Admin',
      actionType: 'context menu',
      group: 'sales'
    })
    // Then "Admin" should not see the following group
    //   | group |
    //   | sales |
    expect(
      await ui.checkGroupsPresenceById({
        actorsEnvironment,
        stepUser: 'Admin',
        expectedGroupIds: ['sales']
      })
    ).toBeFalsy()
    // And "Admin" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Admin' })
  })
})
