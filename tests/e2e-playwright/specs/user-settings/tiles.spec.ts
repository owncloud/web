import { test } from '@playwright/test'
import { config } from './../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('tiles view', { tag: '@predefined-users' }, () => {
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

    // Given "Admin" creates following user using API
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates the following resources
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Alice',
      folderName: 'tile_folder'
    })
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('Users can navigate web via tiles', async () => {
    // When "Alice" switches to the tiles-view
    await ui.switchToTilesViewMode({
      actorsEnvironment,
      stepUser: 'Alice'
    })
    // Then "Alice" sees the resources displayed as tiles
    await ui.shouldSeeResourcesAsTiles({
      actorsEnvironment,
      stepUser: 'Alice'
    })
    // And "Alice" opens folder "tile_folder"
    await ui.openFolder({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'tile_folder'
    })
    // And "Alice" creates the following resources
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      type: 'folder',
      resource: 'tile_folder/tile_folder2'
    })
    // And "Alice" sees the resources displayed as tiles
    await ui.shouldSeeResourcesAsTiles({
      actorsEnvironment,
      stepUser: 'Alice'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
