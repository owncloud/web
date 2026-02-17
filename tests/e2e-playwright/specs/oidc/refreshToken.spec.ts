import { test } from '@playwright/test'
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
    await setAccessAndRefreshToken(usersEnvironment)
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('access token renewal via iframe', async () => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })

    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
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
    await ui.userCreatesProjectSpaces({
      actorsEnvironment,
      stepUser: 'Alice',
      spaces: [{ name: 'team', id: 'team.1' }]
    })

    // When "Alice" waits for token renewal via refresh token
    await ui.waitsForTokenRenewal({
      actorsEnvironment,
      stepUser: 'Alice',
      renewalType: 'refresh token'
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" creates the following resources
    //   | resource     | type   |
    //   | space-folder | folder |
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [{ name: 'space-folder', type: 'folder' }]
    })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource     |
    //   | space-folder |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['space-folder']
    })

    // When "Alice" navigates to new tab
    const actor = actorsEnvironment.getActor({ key: 'Alice' })
    await actor.newTab()

    // And "Alice" waits for token to expire
    await actor.page.waitForTimeout(config.tokenTimeout * 1000)

    // And "Alice" closes the current tab
    await actor.closeCurrentTab()

    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })

    // And "Alice" creates the following resources
    //  | resource          | type    | content   |
    //  | PARENT/parent.txt | txtFile | some text |
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [{ name: 'PARENT/parent.txt', type: 'txtFile', content: 'some text' }]
    })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
