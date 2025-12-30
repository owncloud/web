import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { CrashCodes } from '../../../../packages/web-pkg/src/errors/codes'

test.describe('crash page', () => {
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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('when spaces loading fails, the crash page is displayed', async ({ page }) => {
    await page.route('*/**/me/drives*', (route) => {
      route.abort('500')
    })

    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.expectCrashPageToBeVisible({ page })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })

  test('the crash page has not got any accessibility violations', async ({ page }) => {
    await ui.openCrashPage({ page, errorCode: CrashCodes.RUNTIME_BOOTSTRAP_SPACES_LOAD })
    await ui.expectCrashPageToBeVisible({ page })
    await ui.expectCrashPageHasNoAccessibilityViolations({ page })
  })
})
