import { expect, test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('share', () => {
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

    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('folder', { tag: '@predefined-users' }, async () => {
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['folder_to_shared', 'folder_to_shared_2', 'shared_folder']
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      to: 'folder_to_shared'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem-big.txt',
      to: 'folder_to_shared_2'
    })
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared',
      resourceType: 'folder',
      recipient: 'Brian',
      role: 'Can edit without versions',
      actions: 'SIDEBAR_PANEL'
    })

    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'shared_folder',
      resourceType: 'folder',
      recipient: 'Brian',
      role: 'Can edit without versions',
      actions: 'SIDEBAR_PANEL'
    })

    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared_2',
      resourceType: 'folder',
      recipient: 'Brian',
      role: 'Can edit without versions',
      actions: 'SIDEBAR_PANEL'
    })

    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    await ui.openResource({ actorsEnvironment, stepUser: 'Brian', resource: 'folder_to_shared' })

    // user should have access to unsynced shares
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Brian',
        resource: 'lorem.txt'
      })
    ).toBeTruthy()

    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })

    await ui.disablesSyncForShares({
      actorsEnvironment,
      stepUser: 'Brian',
      resources: ['folder_to_shared', 'folder_to_shared_2']
    })

    expect(
      await ui.shouldSeeSyncStatusForResource({
        actorsEnvironment,
        stepUser: 'Brian',
        resource: 'folder_to_shared'
      })
    ).toBeFalsy()

    expect(
      await ui.shouldSeeSyncStatusForResource({
        actorsEnvironment,
        stepUser: 'Brian',
        resource: 'folder_to_shared_2'
      })
    ).toBeFalsy()

    await ui.enablesSyncForShares({
      actorsEnvironment,
      stepUser: 'Brian',
      resources: ['folder_to_shared', 'folder_to_shared_2']
    })

    expect(
      await ui.shouldSeeSyncStatusForResource({
        actorsEnvironment,
        stepUser: 'Brian',
        resource: 'folder_to_shared'
      })
    ).toBeTruthy()

    expect(
      await ui.shouldSeeSyncStatusForResource({
        actorsEnvironment,
        stepUser: 'Brian',
        resource: 'folder_to_shared_2'
      })
    ).toBeTruthy()

    await ui.renameResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'folder_to_shared/lorem.txt',
      newResourceName: 'lorem_new.txt'
    })

    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resource: 'simple.pdf',
      to: 'folder_to_shared'
    })

    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resource: 'testavatar.jpeg',
      to: 'folder_to_shared_2'
    })

    await ui.deleteResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'lorem-big.txt',
      from: 'folder_to_shared_2',
      actionType: 'SIDEBAR_PANEL'
    })

    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })

    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'PARENT/simple.pdf',
      to: 'folder_to_shared',
      option: 'replace'
    })

    await ui.shouldNotSeeVersionPanelForFiles({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resources: ['simple.pdf'],
      to: 'folder_to_shared'
    })

    await ui.removeSharee({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared_2',
      recipient: 'Brian'
    })

    // await ui.deleteResource({
    //   actorsEnvironment,
    //   stepUser: 'Alice',
    //   resource: 'lorem_new.txt',
    //   from: 'folder_to_shared',
    //   actionType: 'SIDEBAR_PANEL'
    // })

    // await ui.deleteResource({
    //   actorsEnvironment,
    //   stepUser: 'Alice',
    //   resource: 'folder_to_shared',
    //   from: '',
    //   actionType: 'SIDEBAR_PANEL'
    // })

    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
