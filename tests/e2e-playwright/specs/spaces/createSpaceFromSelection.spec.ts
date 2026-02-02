import { test, expect } from '@playwright/test'
import { config } from './../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment,
  SpacesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('create Space shortcut', () => {
  let actorsEnvironment: ActorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const filesEnvironment = new FilesEnvironment()
  const spacesEnvironment = new SpacesEnvironment()

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

    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test.afterEach(async () => {
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('create Space from folder', async () => {
    // And "Alice" creates the following folder in personal space using API
    //   | name             |
    //   | spaceFolder      |
    //   | spaceFolder/test |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['spaceFolder', 'spaceFolder/test']
    })

    // And "Alice" navigates to the personal space page
    await ui.navigateToPersonalSpacePage({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" uploads the following resources
    //   | resource          | to           |
    //   | data.zip          | spaceFolder  |
    //   | lorem.txt         | spaceFolder  |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'data.zip',
      to: 'spaceFolder'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      to: 'spaceFolder'
    })

    // And "Alice" navigates to the personal space page
    await ui.navigateToPersonalSpacePage({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates space "folderSpace" from folder "spaceFolder" using the context menu
    await ui.userCreatesSpaceFromFolderUsingContexMenu({
      actorsEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      spaceName: 'folderSpace',
      folderName: 'spaceFolder'
    })

    // And "Alice" navigates to the project space "folderSpace"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'folderSpace' })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource  |
    //   | data.zip  |
    //   | lorem.txt |
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['data.zip', 'lorem.txt']
      })
    ).toBe(true)
  })

  test('create space from resources', async () => {
    // And "Alice" creates the following folder in personal space using API
    //   | name             |
    //   | resourceFolder   |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Alice',
      folderName: 'resourceFolder'
    })

    // And "Alice" navigates to the personal space page
    await ui.navigateToPersonalSpacePage({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" uploads the following resources
    //   | resource          | to             |
    //   | data.zip          | resourceFolder |
    //   | lorem.txt         |                |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'data.zip',
      to: 'resourceFolder'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      to: ''
    })

    // And "Alice" navigates to the personal space page
    await ui.navigateToPersonalSpacePage({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates space "resourceSpace" from resources using the context menu
    //   | resource                |
    //   | resourceFolder          |
    //   | lorem.txt               |
    await ui.userCreatesSpaceFromResourcesUsingContexMenu({
      actorsEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      spaceName: 'resourceSpace',
      resources: ['resourceFolder', 'lorem.txt']
    })

    // And "Alice" navigates to the project space "resourceSpace"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'resourceSpace' })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource        |
    //   | resourceFolder  |
    //   | lorem.txt       |
    expect(
      await ui.resourceExists({
        actorsEnvironment,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['resourceFolder', 'lorem.txt']
      })
    ).toBe(true)
  })
})
