import { test } from '@playwright/test'
import { config } from './../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('GDPR export', { tag: '@predefined-users' }, () => {
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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('create and download a GDPR export', async () => {
    // And "Alice" opens the user menu
    await ui.openAccountPage({ actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" requests a new GDPR export
    await ui.requestGdprExport({ actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" downloads the GDPR export
    await ui.downloadGdprExport({ actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
