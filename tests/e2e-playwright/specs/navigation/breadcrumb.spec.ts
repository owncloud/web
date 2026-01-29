import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('Access breadcrumb', { tag: '@predefined-users' }, () => {
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
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('Breadcrumb navigation', async () => {
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      type: 'folder',
      resource: 'parent/folder%2Fwith%2FSlashes'
    })
    await ui.userOpensResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'parent/folder%2Fwith%2FSlashes'
    })
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      type: 'folder',
      resource: `'single-double quotes"`
    })
    await ui.userOpensResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: `'single-double quotes"`
    })
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      type: 'folder',
      resource: `"inner" double quote`
    })
    await ui.userOpensResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: `"inner" double quote`
    })
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      type: 'folder',
      resource: 'sub-folder'
    })
    await ui.userOpensResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'sub-folder'
    })
    await ui.userNavigatesToFolderViaBreadcrumb({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: `"inner" double quote`
    })
    await ui.userNavigatesToFolderViaBreadcrumb({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: `'single-double quotes"`
    })
    await ui.userNavigatesToFolderViaBreadcrumb({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folder%2Fwith%2FSlashes'
    })
    await ui.userNavigatesToFolderViaBreadcrumb({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'parent'
    })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
