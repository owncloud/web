import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('rename', { tag: '@predefined-users' }, () => {
  test('rename resources', async ({ world }) => {
    // Given "Admin" creates following user using API
    // | id    |
    // | Alice |
    // | Brian |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })
    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    // And "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    // And "Alice" creates the following folders in personal space using API
    //   | name   |
    //   | folder |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['folder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile         | content      |
    //   | folder/example.txt | example text |
    await api.userHasCreatedFiles({
      world,
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
      world,
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
      world,
      stepUser: 'Alice',
      resource: 'folder',
      role: 'Can edit',
      password: '%public%'
    })

    // And "Brian" navigates to the shared with me page
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    // And "Brian" opens folder "folder"
    await ui.userOpensResources({ world, stepUser: 'Brian', resource: 'folder' })

    // rename in the shares with me page
    // When "Brian" renames the following resource
    //   | resource    | as                 |
    //   | example.txt | renamedByBrian.txt |
    await ui.userRenamesResource({
      world,
      stepUser: 'Brian',
      resource: 'example.txt',
      newResourceName: 'renamedByBrian.txt'
    })

    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })

    // rename in the public link
    // When "Anonymous" opens the public link "Unnamed link"
    await ui.userOpensPublicLink({
      world,
      stepUser: 'Anonymous',
      name: 'Unnamed link'
    })
    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'Anonymous',
      password: '%public%'
    })

    // When "Anonymous" renames the following resource
    //   | resource           | as                     |
    //   | renamedByBrian.txt | renamedByAnonymous.txt |
    await ui.userRenamesResource({
      world,
      stepUser: 'Anonymous',
      resource: 'renamedByBrian.txt',
      newResourceName: 'renamedByAnonymous.txt'
    })

    // rename in the shares with other page
    // And "Alice" navigates to the shared with others page
    await ui.userNavigatesToSharedWithOthersPage({ world, stepUser: 'Alice' })
    // And "Alice" opens folder "folder"
    await ui.userOpensResources({ world, stepUser: 'Alice', resource: 'folder' })
    // When "Alice" renames the following resource
    //   | resource               | as             |
    //   | renamedByAnonymous.txt | renamedByAlice |
    await ui.userRenamesResource({
      world,
      stepUser: 'Alice',
      resource: 'renamedByAnonymous.txt',
      newResourceName: 'renamedByAlice.txt'
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
