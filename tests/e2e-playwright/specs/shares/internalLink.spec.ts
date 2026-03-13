import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  LinksEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

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

    await api.usersHaveBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    await ui.userLogsIn({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.userLogsIn({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    await api.userHasCreatedFolder({ usersEnvironment, stepUser: 'Alice', folderName: 'myfolder' })

    await api.userHasSharedResources({
      usersEnvironment,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'myfolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit',
          resourceType: 'folder'
        }
      ]
    })

    await api.userHasCreatedPublicLinkOfResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'myfolder',
      role: 'Invited people'
    })
  })

  test('opening a link with internal role', async () => {
    await ui.userOpensPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Brian',
      name: 'Unnamed link'
    })
    await ui.userNavigatesToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    await ui.userUploadsResources({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resources: [{ name: 'simple.pdf', to: 'myfolder' }]
    })
    await ui.userUpdatesShareeRole({
      usersEnvironment,
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'myfolder',
      recipient: 'Brian',
      type: 'user',
      role: 'Can view',
      resourceType: 'folder'
    })
    await ui.userLogsOut({ actorsEnvironment, stepUser: 'Alice' })

    await ui.userShouldNotBeAbleToEditResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'myfolder'
    })
    await ui.userLogsOut({ actorsEnvironment, stepUser: 'Brian' })
  })
})
