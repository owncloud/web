import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment } from '../../../e2e/support/environment/index.js'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe('download space', () => {
  let actorsEnvironment

  test.beforeEach(async ({ browser, usersEnvironment }) => {
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
  })

  test('download space', async ({ usersEnvironment, spacesEnvironment }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })

    // Given "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following project spaces using API
    //   | name | id     |
    //   | team | team.1 |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'team',
      id: 'team.1'
    })

    // And "Alice" creates the following folder in space "team" using API
    //   | name        |
    //   | spaceFolder |
    await api.userHasCreatedFoldersInSpace({
      usersEnvironment,
      stepUser: 'Alice',
      spaceName: 'team',
      folders: ['spaceFolder']
    })

    // And "Alice" creates the following file in space "team" using API
    //   | name                  | content    |
    //   | spaceFolder/lorem.txt | space team |
    await api.createFilesInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      files: [{ name: 'spaceFolder/lorem.txt', space: 'team', content: 'space team' }]
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // When "Alice" downloads the space "team.1"
    await ui.userDownloadsSpace({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" adds following users to the project space
    //   | user     | role     | kind  |
    //   | Brian    | Can edit | user  |
    await ui.userAddsMembersToSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      members: [{ user: 'Brian', role: 'Can edit with versions and trashbin', kind: 'user' }]
    })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Brian" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Brian', space: 'team.1' })

    // When "Alice" downloads the space "team.1"
    await ui.userDownloadsSpace({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })
})
