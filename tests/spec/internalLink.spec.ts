import { expect, test } from '@playwright/test'
import { config } from '../e2e/config.js'
import { store } from '../e2e/support'
import {
  ActorsEnvironment,
  UsersEnvironment,
  LinksEnvironment,
  FilesEnvironment
} from '../e2e/support/environment'
import {
  createUserUsingAPI,
  createFolderInPersonalSpaceUsingAPI,
  shareResourceUsingAPI,
  createPublicLinkOfResourceUsingAPI
} from '../helper/api'
import { setAccessAndRefreshToken } from '../helper/setAccessAndRefreshToken'
import { cleanUpUser } from '../helper/cleanup'
import { openPublicLink } from '../helper/public'
import { navigateToSharedWithMePage, updateShareeRole } from '../helper/shares'
import { uploadResource, isAbleToEditFileOrFolder } from '../helper/resources'
import { LogInUser, LogOutUser } from '../helper/session'

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

    await createUserUsingAPI(usersEnvironment, 'Admin', 'Alice')
    await createUserUsingAPI(usersEnvironment, 'Admin', 'Brian')

    await LogInUser(usersEnvironment, actorsEnvironment, 'Alice')
    await LogInUser(usersEnvironment, actorsEnvironment, 'Brian')

    await createFolderInPersonalSpaceUsingAPI(usersEnvironment, 'Alice', 'myfolder')

    await shareResourceUsingAPI(
      usersEnvironment,
      'Alice',
      'myfolder',
      'Brian',
      'user',
      'Can edit',
      'folder'
    )

    await createPublicLinkOfResourceUsingAPI(
      usersEnvironment,
      'Alice',
      'myfolder',
      'Invited people'
    )
  })

  test('opening a link with internal role', async () => {
    await openPublicLink(actorsEnvironment, linksEnvironment, 'Brian', 'Unnamed link')
    await navigateToSharedWithMePage(actorsEnvironment, 'Brian')
    await uploadResource(actorsEnvironment, filesEnvironment, 'Brian', 'simple.pdf', 'myfolder')
    await updateShareeRole(
      usersEnvironment,
      actorsEnvironment,
      'Alice',
      'myfolder',
      'Brian',
      'user',
      'Can view',
      'folder'
    )
    await LogOutUser(actorsEnvironment, 'Alice')

    expect(await isAbleToEditFileOrFolder(actorsEnvironment, 'Brian', 'myfolder')).toBeFalsy()
    await LogOutUser(actorsEnvironment, 'Brian')
  })

  test.afterAll(async () => {
    await cleanUpUser(
      store.createdUserStore,
      usersEnvironment.getUser({ key: config.adminUsername })
    )
  })
})
