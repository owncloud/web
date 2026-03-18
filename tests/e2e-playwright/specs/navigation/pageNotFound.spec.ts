import { test } from '../../support/test'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe('Page not found', { tag: '@predefined-users' }, () => {
  test('not found page', async ({ world }) => {
    // Given "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })

    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })

    // When "Alice" navigates to a non-existing page
    await ui.userNavigatesToNonExistingPage({ world, stepUser: 'Alice' })
    // Then "Alice" should see the not found page
    await ui.userShouldSeeNotFoundPage({ world, stepUser: 'Alice' })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
