import { expect, test } from '@playwright/test'
import { config } from '../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  LinksEnvironment,
  FilesEnvironment
} from '../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../helpers/setAccessAndRefreshToken'
import * as api from '../steps/api/api'
import * as ui from '../steps/ui/index'

test.describe('internal link share', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const linksEnvironment = new LinksEnvironment()
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

    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    await api.userHasCreatedFolder({ usersEnvironment, stepUser: 'Alice', folderName: 'myfolder' })

    await api.userHasSharedResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'myfolder',
      recipient: 'Brian',
      type: 'user',
      role: 'Can edit',
      resourceType: 'folder'
    })

    await api.userHasCreatedPublicLinkOfResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'myfolder',
      role: 'Invited people'
    })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('opening a link with internal role', async () => {
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Brian',
      name: 'Unnamed link'
    })
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resource: 'simple.pdf',
      to: 'myfolder'
    })
    await ui.updateShareeRole({
      usersEnvironment,
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'myfolder',
      recipient: 'Brian',
      type: 'user',
      role: 'Can view',
      resourceType: 'folder'
    })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })

    expect(
      await ui.isAbleToEditFileOrFolder({
        actorsEnvironment,
        stepUser: 'Brian',
        resource: 'myfolder'
      })
    ).toBeFalsy()
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })
})
