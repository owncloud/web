import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { CRASH_CODES } from '../../../../packages/web-pkg/src/errors/codes'

test.describe('crash page', () => {
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
    await api.usersHaveBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('when spaces loading fails, the crash page is displayed', async () => {
    const { page } = actorsEnvironment.getActor({ key: 'Alice' })

    await page.route('**/me/drives*', (route) => {
      route.abort('failed')
    })
    await page.reload()

    await ui.expectCrashPageToBeVisible({ page })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })

  test('the crash page does not have any accessibility violations', async () => {
    const { page } = actorsEnvironment.getActor({ key: 'Alice' })
    await ui.openCrashPage({
      page,
      errorCode: CRASH_CODES.RUNTIME_BOOTSTRAP_SPACES_LOAD
    })
    await ui.expectCrashPageToBeVisible({ page })
    await ui.expectCrashPageHasNoAccessibilityViolations({ page })
  })
})
