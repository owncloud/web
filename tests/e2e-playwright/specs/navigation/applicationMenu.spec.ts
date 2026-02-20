import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('Application menu', { tag: '@predefined-users' }, () => {
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
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test('Open text editor via application menu', async () => {
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'text-editor' })
    await ui.userAddsContentInTextEditor({
      actorsEnvironment,
      stepUser: 'Alice',
      text: 'Hello world',
      editor: 'TextEditor'
    })
    await ui.userSavesTextEditor({ actorsEnvironment, stepUser: 'Alice' })
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['New file.txt']
    })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
