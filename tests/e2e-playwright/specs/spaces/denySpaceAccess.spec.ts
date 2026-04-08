import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'
import { displayedResources, actions } from '../../support/constants'

test.describe('deny space access', () => {
  test('deny and grant access', async ({ world }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
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

    // And "Alice" creates the following project space using API
    //   | name  | id    |
    //   | sales | sales |
    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [{ name: 'sales', id: 'sales' }]
    })

    // And "Alice" creates the following folder in space "sales" using API
    //   | name |
    //   | f1   |
    //   | f2   |
    await api.userHasCreatedFoldersInSpace({
      world,
      stepUser: 'Alice',
      spaceName: 'sales',
      folders: ['f1', 'f2']
    })

    // And "Alice" adds the following members to the space "sales" using API
    //   | user  | role     | shareType |
    //   | Brian | Can edit | user      |
    await api.userHasAddedMembersToSpace({
      world,
      stepUser: 'Alice',
      space: 'sales',
      sharee: [{ user: 'Brian', role: 'Can edit with versions and trashbin', shareType: 'user' }]
    })

    // When "Alice" navigates to the project space "sales"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'sales' })

    // When "Alice" shares the following resource using the sidebar panel
    //   | resource | recipient | type | role          | resourceType |
    //   | f1       | Brian     | user | Cannot access | folder       |
    await ui.userSharesResources({
      world,
      stepUser: 'Alice',
      actionType: actions.sideBarPanel,
      shares: [
        {
          resource: 'f1',
          recipient: 'Brian',
          type: 'user',
          role: 'Cannot access',
          resourceType: 'folder'
        }
      ]
    })

    // And "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })

    // And "Brian" navigates to the project space "sales"
    await ui.userNavigatesToSpace({ world, stepUser: 'Brian', space: 'sales' })

    // Then following resources should not be displayed in the files list for user "Brian"
    //   | resource |
    //   | f1       |
    await ui.userShouldNotSeeTheResources({
      world,
      listType: displayedResources.filesList,
      stepUser: 'Brian',
      resources: ['f1']
    })

    // But following resources should be displayed in the files list for user "Brian"
    //   | resource |
    //   | f2       |
    await ui.userShouldSeeResources({
      world,
      listType: displayedResources.filesList,
      stepUser: 'Brian',
      resources: ['f2']
    })
    // allow access - deleting "Cannot access" share
    // When "Alice" removes following sharee
    //   | resource | recipient |
    //   | f1       | Brian     |
    await ui.userRemovesSharees({
      world,
      stepUser: 'Alice',
      sharees: [
        {
          resource: 'f1',
          recipient: 'Brian'
        }
      ]
    })

    // And "Brian" navigates to the project space "sales"
    await ui.userNavigatesToSpace({ world, stepUser: 'Brian', space: 'sales' })

    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource |
    //   | f1       |
    //   | f2       |
    await ui.userShouldSeeResources({
      world,
      listType: displayedResources.filesList,
      stepUser: 'Brian',
      resources: ['f1', 'f2']
    })

    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })
  })
})
