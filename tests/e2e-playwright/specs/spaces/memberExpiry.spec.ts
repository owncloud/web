import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('spaces member expiry', () => {
  test('space members can be invited with an expiration date', async ({ world }) => {
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
    //  | id    | role        |
    //  | Alice | Space Admin |
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })

    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })

    // And "Alice" creates the following project space using API
    //  | name | id     |
    //  | team | team.1 |
    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [{ name: 'team', id: 'team.1' }]
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" adds following users to the project space
    //   | user  | role     | kind |
    //   | Brian | Can edit | user |
    await ui.userAddsMembersToSpace({
      world,
      stepUser: 'Alice',
      members: [{ user: 'Brian', role: 'Can edit with versions and trash bin', kind: 'user' }]
    })

    // And "Alice" sets the expiration date of the member "Brian" of the project space to "+5 days"
    await ui.userAddsExpirationDate({
      world,
      stepUser: 'Alice',
      memberName: 'Brian',
      expirationDate: '+5 days'
    })

    // When "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })

    // And "Brian" navigates to the project space "team.1"
    await ui.userNavigatesToSpace({ world, stepUser: 'Brian', space: 'team.1' })

    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })

    // And "Alice" navigates to the project space "team.1"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" removes the expiration date of the member "Brian" of the project space
    await ui.userRemovesExpirationDate({
      world,
      stepUser: 'Alice',
      memberName: 'Brian'
    })

    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
