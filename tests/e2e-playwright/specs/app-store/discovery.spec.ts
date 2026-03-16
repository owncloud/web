import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment/index.js'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as ui from '../../steps/ui/index'

test.describe('details', { tag: '@predefined-users' }, () => {
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

  test('apps can be searched and downloaded', async () => {
    // When "Admin" logs in
    await ui.userLogsIn({ usersEnvironment, actorsEnvironment, stepUser: 'Admin' })

    // And "Admin" navigates to the app store
    await ui.userOpensAppStore({ actorsEnvironment, stepUser: 'Admin' })

    // Then "Admin" should see the app store
    await ui.userShouldSeeAppStore({ actorsEnvironment, stepUser: 'Admin' })

    // And "Admin" should see the following apps
    //   | app         |
    //   | Draw.io     |
    //   | JSON Viewer |
    //   | Unzip       |
    await ui.userShouldSeeApps({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedApps: ['Draw.io', 'JSON Viewer', 'Unzip']
    })

    // When "Admin" enters the search term "draw"
    await ui.userSetsSearchTerm({ actorsEnvironment, stepUser: 'Admin', searchTerm: 'draw' })

    // Then "Admin" should see the following apps
    //   | app     |
    //   | Draw.io |
    await ui.userShouldSeeApps({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedApps: ['Draw.io']
    })

    // When "Admin" clicks on the tag "viewer" of the app "Draw.io"
    await ui.userSelectsAppTag({
      actorsEnvironment,
      stepUser: 'Admin',
      tag: 'viewer',
      app: 'Draw.io'
    })

    // Then "Admin" should see the following apps
    //   | app         |
    //   | JSON Viewer |
    //   | Draw.io     |
    await ui.userShouldSeeApps({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedApps: ['Draw.io', 'JSON Viewer']
    })

    // When "Admin" clicks on the app "JSON Viewer"
    await ui.userSelectsApp({ actorsEnvironment, stepUser: 'Admin', app: 'JSON Viewer' })

    // Then "Admin" should see the app details of "JSON Viewer"
    await ui.userShouldSeeAppDetails({
      actorsEnvironment,
      stepUser: 'Admin',
      app: 'JSON Viewer'
    })

    // When "Admin" clicks on the tag "viewer"
    await ui.userSelectsTag({ actorsEnvironment, stepUser: 'Admin', tag: 'viewer' })

    // Then "Admin" should see the app store
    await ui.userShouldSeeAppStore({ actorsEnvironment, stepUser: 'Admin' })

    // Then "Admin" should see the following apps
    //   | app         |
    //   | JSON Viewer |
    //   | Draw.io     |
    await ui.userShouldSeeApps({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedApps: ['Draw.io', 'JSON Viewer']
    })

    // And "Admin" logs out
    await ui.userLogsOut({ actorsEnvironment, stepUser: 'Admin' })
  })
})
