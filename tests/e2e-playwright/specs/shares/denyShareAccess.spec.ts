import { expect, test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('deny share access', () => {
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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })

    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: [
        'folder_to_shared',
        'folder_to_shared/folder',
        'folder_to_shared/folder_to_deny'
      ]
    })

    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })

    await ui.shareResource({
      role: 'Can view',
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resource: 'folder_to_shared',
      recipient: 'Brian',
      type: 'user',
      resourceType: 'folder'
    })

    await ui.openResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared'
    })

    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_deny',
      resourceType: 'folder',
      recipient: 'Brian',
      role: 'Cannot access',
      actionType: 'SIDEBAR_PANEL',
      type: 'user'
    })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('deny and grant access', async () => {
    // deny access
    await ui.openApplication({
      actorsEnvironment,
      stepUser: 'Brian',
      name: 'files'
    })

    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    await ui.openResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'folder_to_shared'
    })
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Brian',
        resource: 'folder_to_deny'
      })
    ).toBeFalsy()

    await ui.openApplication({
      actorsEnvironment,
      stepUser: 'Alice',
      name: 'files'
    })

    await ui.openResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared'
    })

    // allow access - deleting "Cannot access" share

    await ui.removeSharee({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_deny',
      recipient: 'Brian'
    })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Brian', name: 'files' })
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    await ui.openResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'folder_to_shared'
    })
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Brian',
        resource: 'folder_to_deny'
      })
    ).toBeTruthy()

    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
