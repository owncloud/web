import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  FilesEnvironment,
  UsersEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'

test.describe('general management', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const filesEnvironment = new FilesEnvironment()

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
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Admin' })
  })

  test('logo can be changed in the admin settings', async () => {
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.navigateToGeneralManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.uploadLogoFromLocalPath({
      actorsEnvironment,
      stepUser: 'Admin',
      localFile: 'filesForUpload/testavatar.png',
      filesEnvironment
    })
    await ui.navigateToGeneralManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.resetLogo({ actorsEnvironment, stepUser: 'Admin' })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Admin' })
  })
})
