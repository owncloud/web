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

    await api.userHasBeenCreated(usersEnvironment, 'Admin', 'Alice')
    await api.userHasBeenCreated(usersEnvironment, 'Admin', 'Brian')

    await ui.LogInUser(usersEnvironment, actorsEnvironment, 'Alice')
    await ui.LogInUser(usersEnvironment, actorsEnvironment, 'Brian')

    await api.userHasCreatedFolder(usersEnvironment, 'Alice', 'myfolder')

    await api.userHasSharedResource(
      usersEnvironment,
      'Alice',
      'myfolder',
      'Brian',
      'user',
      'Can edit',
      'folder'
    )

    await api.userHasCreatedPublicLinkOfResource(
      usersEnvironment,
      'Alice',
      'myfolder',
      'Invited people'
    )
  })

  test('opening a link with internal role', async () => {
    await ui.openPublicLink(actorsEnvironment, linksEnvironment, 'Brian', 'Unnamed link')
    await ui.navigateToSharedWithMePage(actorsEnvironment, 'Brian')
    await ui.uploadResource(actorsEnvironment, filesEnvironment, 'Brian', 'simple.pdf', 'myfolder')
    await ui.updateShareeRole(
      usersEnvironment,
      actorsEnvironment,
      'Alice',
      'myfolder',
      'Brian',
      'user',
      'Can view',
      'folder'
    )
    await ui.LogOutUser(actorsEnvironment, 'Alice')

    expect(await ui.isAbleToEditFileOrFolder(actorsEnvironment, 'Brian', 'myfolder')).toBeFalsy()
    await ui.LogOutUser(actorsEnvironment, 'Brian')
  })
})
