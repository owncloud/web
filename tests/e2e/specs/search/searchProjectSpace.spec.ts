import { test } from '../../environment/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { resourcePage, searchScope } from '../../environment/constants'

test.describe('Search in the project space', () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })

    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })

    await ui.userLogsIn({ world, stepUser: 'Alice' })

    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [{ name: 'team', id: 'team.1' }]
    })

    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'folder(WithSymbols:!;_+-&)', type: 'folder' }]
    })

    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: "new-'single'quotes.txt", to: 'folder(WithSymbols:!;_+-&)' }]
    })

    await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })
  })

  test('Search in the project spaces', async ({ world }) => {
    // search for project space objects
    await ui.userSearchesGloballyWithFilter({
      world,
      stepUser: 'Alice',
      keyword: "-'s",
      filter: searchScope.allFiles
    })

    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.searchList,
      stepUser: 'Alice',
      resources: ["new-'single'quotes.txt"]
    })

    await ui.userShouldNotSeeTheResources({
      world,
      listType: resourcePage.searchList,
      stepUser: 'Alice',
      resources: ['folder(WithSymbols:!;_+-&)']
    })

    await ui.userSearchesGloballyWithFilter({
      world,
      stepUser: 'Alice',
      keyword: '!;_+-&)',
      filter: searchScope.allFiles
    })

    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.searchList,
      stepUser: 'Alice',
      resources: ['folder(WithSymbols:!;_+-&)']
    })

    await ui.userShouldNotSeeTheResources({
      world,
      listType: resourcePage.searchList,
      stepUser: 'Alice',
      resources: ["new-'single'quotes.txt"]
    })

    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
