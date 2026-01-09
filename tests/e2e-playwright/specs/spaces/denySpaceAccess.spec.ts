import { test } from '@playwright/test'
import { config } from './../../../e2e/config.js'
import {
  ActorsEnvironment,
  SpacesEnvironment,
  UsersEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('deny space access', () => {
  let actorsEnvironment: ActorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const spacesEnvironment = new SpacesEnvironment()

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

  test('deny and grant access', async () => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })

    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following project space using API
    //   | name  | id    |
    //   | sales | sales |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'sales',
      id: 'sales'
    })

    // And "Alice" creates the following folder in space "sales" using API
    //   | name |
    //   | f1   |
    //   | f2   |
    await api.userHasCreatedFolderInSpace({
      usersEnvironment,
      stepUser: 'Alice',
      spaceName: 'team',
      folder: 'spaceFolder'
    })

    // And "Alice" adds the following members to the space "sales" using API
    //   | user  | role     | shareType |
    //   | Brian | Can edit | user      |
    await api.userHasAddedMembersToSpace({
      usersEnvironment,
      stepUser: 'Alice',
      space: 'team',
      shareType: 'user',
      sharee: 'Brian',
      role: 'Can edit'
    })

    // When "Alice" navigates to the project space "sales"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'sales' })

    // When "Alice" shares the following resource using the sidebar panel
    //   | resource | recipient | type | role          | resourceType |
    //   | f1       | Brian     | user | Cannot access | folder       |
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resource: 'f1',
      recipient: 'Brian',
      type: 'user',
      role: 'Cannot access',
      resourceType: 'folder'
    })

    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Brian" navigates to the project space "sales"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Brian', space: 'sales' })

    // Then following resources should not be displayed in the files list for user "Brian"
    //   | resource |
    //   | f1       |
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Brian',
        resource: 'f1'
      })
    ).toBe(false)

    // But following resources should be displayed in the files list for user "Brian"
    //   | resource |
    //   | f2       |
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Brian',
        resource: 'f2'
      })
    ).toBe(true)
    // allow access - deleting "Cannot access" share
    // When "Alice" removes following sharee
    //   | resource | recipient |
    //   | f1       | Brian     |
    await ui.removeSharee({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'f1',
      recipient: 'Brian'
    })

    // And "Brian" navigates to the project space "sales"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Brian', space: 'sales' })

    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource |
    //   | f1       |
    //   | f2       |
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Brian',
        resource: 'f1'
      })
    ).toBe(true)
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Brian',
        resource: 'f2'
      })
    ).toBe(true)

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })
})
