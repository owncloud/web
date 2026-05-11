import { test } from '../../environment/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('tiles view', { tag: '@predefined-users' }, () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following user using API
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })
    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    // And "Alice" creates the following resources
    await api.userHasCreatedFolder({
      world,
      stepUser: 'Alice',
      folderName: 'tile_folder'
    })
  })

  test('Users can navigate web via tiles', async ({ world }) => {
    // When "Alice" switches to the tiles-view
    await ui.userSwitchesToTilesViewMode({
      world,
      stepUser: 'Alice'
    })
    // Then "Alice" sees the resources displayed as tiles
    await ui.userShouldSeeResourcesAsTiles({
      world,
      stepUser: 'Alice'
    })
    // And "Alice" opens folder "tile_folder"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: 'tile_folder'
    })
    // And "Alice" creates the following resources
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'tile_folder/tile_folder2', type: 'folder' }]
    })
    // And "Alice" sees the resources displayed as tiles
    await ui.userShouldSeeResourcesAsTiles({
      world,
      stepUser: 'Alice'
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
