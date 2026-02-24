import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  LinksEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('rename', { tag: '@predefined-users' }, () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const linksEnvironment = new LinksEnvironment()

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
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('rename resources', async () => {
    // Given "Admin" creates following user using API
    // | id    |
    // | Alice |
    // | Brian |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Alice" creates the following folders in personal space using API
    //   | name   |
    //   | folder |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['folder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile         | content      |
    //   | folder/example.txt | example text |
    await api.userHasCreatedFiles({
      usersEnvironment,
      stepUser: 'Alice',
      files: [
        {
          pathToFile: 'folder/example.txt',
          content: 'example text'
        }
      ]
    })
    // And "Alice" shares the following resource using API
    //   | resource | resourceType | recipient | type | role     |
    //   | folder   | folder       | Brian     | user | Can edit |
    await api.userHasSharedResources({
      usersEnvironment,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'folder',
          resourceType: 'folder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit'
        }
      ]
    })
    // And "Alice" creates a public link of following resource using API
    //   | resource | role     | password |
    //   | folder   | Can edit | %public% |
    await api.userHasCreatedPublicLinkOfResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'folder',
      role: 'Can edit',
      password: '%public%'
    })

    // And "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" opens folder "folder"
    await ui.userOpensResources({ actorsEnvironment, stepUser: 'Brian', resource: 'folder' })

    // rename in the shares with me page
    // When "Brian" renames the following resource
    //   | resource    | as                 |
    //   | example.txt | renamedByBrian.txt |
    await ui.userRenamesResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'example.txt',
      newResourceName: 'renamedByBrian.txt'
    })

    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })

    // rename in the public link
    // When "Anonymous" opens the public link "Unnamed link"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'Unnamed link'
    })
    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      stepUser: 'Anonymous',
      password: '%public%'
    })

    // When "Anonymous" renames the following resource
    //   | resource           | as                     |
    //   | renamedByBrian.txt | renamedByAnonymous.txt |
    await ui.userRenamesResource({
      actorsEnvironment,
      stepUser: 'Anonymous',
      resource: 'renamedByBrian.txt',
      newResourceName: 'renamedByAnonymous.txt'
    })

    // rename in the shares with other page
    // And "Alice" navigates to the shared with others page
    await ui.userNavigatesToSharedWithOthersPage({ actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" opens folder "folder"
    await ui.userOpensResources({ actorsEnvironment, stepUser: 'Alice', resource: 'folder' })
    // When "Alice" renames the following resource
    //   | resource               | as             |
    //   | renamedByAnonymous.txt | renamedByAlice |
    await ui.userRenamesResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'renamedByAnonymous.txt',
      newResourceName: 'renamedByAlice.txt'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
