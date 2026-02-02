import { test, expect } from '@playwright/test'
import { config } from './../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('details', () => {
  let actorsEnvironment: ActorsEnvironment
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
  })

  test('access token renewal via iframe', async () => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })

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

    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })

    // And "Alice" navigates to the projects space page
    await ui.navigateToSpacesPage({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following project spaces
    //   | name | id     |
    //   | team | team.1 |
    await ui.createProjectSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      name: 'team',
      id: 'team.1'
    })

    // When "Alice" waits for token renewal via iframe
    await ui.waitsForTokenRenewal({
      actorsEnvironment,
      stepUser: 'Alice',
      renewalType: 'iframe'
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" creates the following resources
    //   | resource     | type   |
    //   | space-folder | folder |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'space-folder',
      type: 'folder'
    })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource     |
    //   | space-folder |
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['space-folder']
      })
    ).toBeTruthy()

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
