import { expect } from '@playwright/test'
import { test } from '../../support/test'
import { config } from './../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
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

  test('Apps can be viewed and downloaded', async () => {
    // When "Admin" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Admin' })

    // And "Admin" navigates to the app store
    await ui.openAppStore({ actorsEnvironment, stepUser: 'Admin' })

    // Then "Admin" should see the app store
    await ui.waitForAppStoreIsVisible({ actorsEnvironment, stepUser: 'Admin' })

    // When "Admin" clicks on the app "Development boilerplate"
    await ui.selectApp({ actorsEnvironment, stepUser: 'Admin', app: 'Development boilerplate' })

    // Then "Admin" should see the app details of "Development boilerplate"
    await ui.waitForAppDetailsIsVisible({
      actorsEnvironment,
      stepUser: 'Admin',
      app: 'Development boilerplate'
    })

    // And "Admin" downloads app version "0.1.0"
    const downloadedVersion = await ui.downloadAppVersion({
      actorsEnvironment,
      stepUser: 'Admin',
      version: '0.1.0'
    })
    expect(downloadedVersion).toContain('0.1.0')

    // When "Admin" navigates back to the app store overview
    await ui.navigateToAppStoreOverview({
      actorsEnvironment,
      stepUser: 'Admin'
    })

    // Then "Admin" should see the app store
    await ui.waitForAppStoreIsVisible({ actorsEnvironment, stepUser: 'Admin' })

    // And "Admin" downloads the latest version of the app "Development boilerplate"
    const downloadedApp = await ui.downloadApp({
      actorsEnvironment,
      stepUser: 'Admin',
      app: 'Development boilerplate'
    })
    expect(downloadedApp).toBeDefined()

    // And "Admin" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Admin' })
  })
})
