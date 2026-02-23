import { expect } from '@playwright/test'
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
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Admin' })

    // And "Admin" navigates to the app store
    await ui.openAppStore({ actorsEnvironment, stepUser: 'Admin' })

    // Then "Admin" should see the app store
    await ui.waitForAppStoreIsVisible({ actorsEnvironment, stepUser: 'Admin' })

    // And "Admin" should see the following apps
    //   | app         |
    //   | Draw.io     |
    //   | JSON Viewer |
    //   | Unzip       |
    let apps = await ui.getAppsList({ actorsEnvironment, stepUser: 'Admin' })
    expect(apps).toContain('Draw.io')
    expect(apps).toContain('JSON Viewer')
    expect(apps).toContain('Unzip')

    // When "Admin" enters the search term "draw"
    await ui.setSearchTerm({ actorsEnvironment, stepUser: 'Admin', searchTerm: 'draw' })

    // Then "Admin" should see the following apps
    //   | app     |
    //   | Draw.io |
    apps = []
    apps = await ui.getAppsList({ actorsEnvironment, stepUser: 'Admin' })
    expect(apps).toContain('Draw.io')

    // When "Admin" clicks on the tag "viewer" of the app "Draw.io"
    await ui.selectAppTag({ actorsEnvironment, stepUser: 'Admin', tag: 'viewer', app: 'Draw.io' })

    // Then "Admin" should see the following apps
    //   | app         |
    //   | JSON Viewer |
    //   | Draw.io     |
    apps = []
    apps = await ui.getAppsList({ actorsEnvironment, stepUser: 'Admin' })
    expect(apps).toContain('Draw.io')
    expect(apps).toContain('JSON Viewer')

    // When "Admin" clicks on the app "JSON Viewer"
    await ui.selectApp({ actorsEnvironment, stepUser: 'Admin', app: 'JSON Viewer' })

    // Then "Admin" should see the app details of "JSON Viewer"
    await ui.waitForAppDetailsIsVisible({
      actorsEnvironment,
      stepUser: 'Admin',
      app: 'JSON Viewer'
    })

    // When "Admin" clicks on the tag "viewer"
    await ui.selectTag({ actorsEnvironment, stepUser: 'Admin', tag: 'viewer' })

    // Then "Admin" should see the app store
    await ui.waitForAppStoreIsVisible({ actorsEnvironment, stepUser: 'Admin' })

    // Then "Admin" should see the following apps
    //   | app         |
    //   | JSON Viewer |
    //   | Draw.io     |
    apps = []
    apps = await ui.getAppsList({ actorsEnvironment, stepUser: 'Admin' })
    expect(apps).toContain('Draw.io')
    expect(apps).toContain('JSON Viewer')

    // And "Admin" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Admin' })
  })
})
