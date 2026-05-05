import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'
import { resourcePage } from '../../support/constants'

test.describe('create Space shortcut', () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })
    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
  })

  test.afterEach(async ({ world }) => {
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })

  test('create Space from folder', async ({ world }) => {
    // And "Alice" creates the following folder in personal space using API
    //   | name             |
    //   | spaceFolder      |
    //   | spaceFolder/test |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['spaceFolder', 'spaceFolder/test']
    })

    // And "Alice" navigates to the personal space page
    await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })

    // And "Alice" uploads the following resources
    //   | resource          | to           |
    //   | data.zip          | spaceFolder  |
    //   | lorem.txt         | spaceFolder  |
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [
        { name: 'data.zip', to: 'spaceFolder' },
        { name: 'lorem.txt', to: 'spaceFolder' }
      ]
    })

    // And "Alice" navigates to the personal space page
    await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })

    // And "Alice" creates space "folderSpace" from folder "spaceFolder" using the context menu
    await ui.userCreatesSpaceFromFolderUsingContexMenu({
      world,
      stepUser: 'Alice',
      spaceName: 'folderSpace',
      folderName: 'spaceFolder'
    })

    // And "Alice" navigates to the project space "folderSpace"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'folderSpace' })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource  |
    //   | data.zip  |
    //   | lorem.txt |
    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.filesList,
      stepUser: 'Alice',
      resources: ['data.zip', 'lorem.txt']
    })
  })

  test('create space from resources', async ({ world }) => {
    // And "Alice" creates the following folder in personal space using API
    //   | name             |
    //   | resourceFolder   |
    await api.userHasCreatedFolder({
      world,
      stepUser: 'Alice',
      folderName: 'resourceFolder'
    })

    // And "Alice" navigates to the personal space page
    await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })

    // And "Alice" uploads the following resources
    //   | resource          | to             |
    //   | data.zip          | resourceFolder |
    //   | lorem.txt         |                |
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'data.zip', to: 'resourceFolder' }, { name: 'lorem.txt' }]
    })

    // And "Alice" navigates to the personal space page
    await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })

    // And "Alice" creates space "resourceSpace" from resources using the context menu
    //   | resource                |
    //   | resourceFolder          |
    //   | lorem.txt               |
    await ui.userCreatesSpaceFromResourcesUsingContexMenu({
      world,
      stepUser: 'Alice',
      spaceName: 'resourceSpace',
      resources: ['resourceFolder', 'lorem.txt']
    })

    // And "Alice" navigates to the project space "resourceSpace"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'resourceSpace' })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource        |
    //   | resourceFolder  |
    //   | lorem.txt       |
    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.filesList,
      stepUser: 'Alice',
      resources: ['resourceFolder', 'lorem.txt']
    })
  })
})
