import {test, expect} from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('Application menu', () => {
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

  test('Open text editor via application menu', async () => {
    await ui.openApplication({actorsEnvironment, stepUser: 'Alice', name: 'text-editor'})
    await ui.fillContent({actorsEnvironment, stepUser: 'Alice', text: 'Hello world', editor: 'TextEditor'})
    await ui.saveFile({actorsEnvironment, stepUser: 'Alice'})
    await ui.closeFileEditor({actorsEnvironment, stepUser: 'Alice'})
    expect(
        await ui.resourceExists({
          actorsEnvironment,
          listType: 'files list',
          stepUser: 'Alice',
          resource: "New file.txt" 
        })
      ).toBeTruthy()
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})