import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('link', () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })
  })

  test('public link', { tag: '@predefined-users' }, async ({ world }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Brian |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Brian']
    })

    //  And "Alice" creates the following folders in personal space using API
    //   | name                   |
    //   | folderPublic           |
    //   | folderPublic/SubFolder |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['folderPublic', 'folderPublic/SubFolder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile             | content     |
    //   | folderPublic/lorem.txt | lorem ipsum |
    await api.userHasCreatedFiles({
      world,
      stepUser: 'Alice',
      files: [{ pathToFile: 'folderPublic/lorem.txt', content: 'lorem ipsum' }]
    })

    // When "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource     | role             | password |
    //   | folderPublic | Secret File Drop | %public% |
    await ui.userCreatesPublicLink({
      world,
      stepUser: 'Alice',
      resource: 'folderPublic',
      role: 'Secret File Drop',
      password: '%public%'
    })
    // And "Alice" renames the most recently created public link of resource "folderPublic" to "myPublicLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'folderPublic',
      newName: 'myPublicLink'
    })
    // And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "Secret File Drop"
    await ui.userChangesRoleOfPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'myPublicLink',
      newRole: 'Secret File Drop'
    })
    // And "Alice" sets the expiration date of the public link named "myPublicLink" of resource "folderPublic" to "+5 days"
    await ui.userSetsExpirationDateOfThePublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'myPublicLink',
      expireDate: '+5 days'
    })
    // When "Anonymous" opens the public link "myPublicLink"
    await ui.userOpensPublicLink({
      world,
      stepUser: 'Anonymous',
      name: 'myPublicLink'
    })
    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      world,
      password: '%public%',
      stepUser: 'Anonymous'
    })
    // And "Anonymous" drop uploads following resources
    //   | resource     |
    //   | textfile.txt |
    await ui.userDropUploadsResources({
      world,
      stepUser: 'Anonymous',
      resources: ['textfile.txt']
    })

    // authenticated user
    // When "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    // And "Brian" opens the public link "myPublicLink"
    await ui.userOpensPublicLink({
      world,
      stepUser: 'Brian',
      name: 'myPublicLink'
    })
    // And "Brian" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      world,
      password: '%public%',
      stepUser: 'Brian'
    })
    // And "Brian" drop uploads following resources
    //   | resource   |
    //   | simple.pdf |
    await ui.userDropUploadsResources({
      world,
      stepUser: 'Brian',
      resources: ['simple.pdf']
    })

    //   When "Alice" opens folder "folderPublic"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: 'folderPublic'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource     |
    //   | textfile.txt |
    //   | simple.pdf   |
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['textfile.txt', 'simple.pdf']
    })
    // And "Alice" opens the "files" app
    await ui.userOpensApplication({
      world,
      stepUser: 'Alice',
      name: 'files'
    })
    // And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "Can edit"
    await ui.userChangesRoleOfPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'myPublicLink',
      newRole: 'Can edit'
    })
    // And "Brian" refreshes the old link
    await ui.userRefreshesTheOldLink({ world, stepUser: 'Brian' })

    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource     |
    //   | textfile.txt |
    //   | simple.pdf   |
    //   | SubFolder    |
    //   | lorem.txt    |
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['textfile.txt', 'simple.pdf', 'SubFolder', 'lorem.txt']
    })
    // And "Brian" deletes the following resources from public link using sidebar panel
    //   | resource   |
    //   | simple.pdf |
    await ui.userDeletesResourcesFromPublicLink({
      world,
      stepUser: 'Brian',
      actionType: 'SIDEBAR_PANEL',
      resources: [{ resource: 'simple.pdf' }]
    })
    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })

    // And "Anonymous" refreshes the old link
    await ui.userRefreshesTheOldLink({ world, stepUser: 'Anonymous' })
    // And "Anonymous" downloads the following public link resources using the sidebar panel
    //   | resource     | type |
    //   | lorem.txt    | file |
    //   | textfile.txt | file |
    await ui.userDownloadsThePublicLinkResources({
      world,
      stepUser: 'Anonymous',
      actionType: 'SIDEBAR_PANEL',
      resources: [
        { resource: 'lorem.txt', type: 'file' },
        { resource: 'textfile.txt', type: 'file' }
      ]
    })
    // And "Anonymous" uploads the following resources in public link page
    //   | resource      | option  |
    //   | new-lorem.txt |         |
    //   | lorem.txt     | replace |
    await ui.userUploadsResourcesInPublicLink({
      world,
      stepUser: 'Anonymous',
      resources: [{ name: 'new-lorem.txt' }, { name: 'lorem.txt', option: 'replace' }]
    })
    // And "Anonymous" creates the following resources
    //   | resource       | type   |
    //   | myfolder/child | folder |
    await ui.userCreatesResources({
      world,
      stepUser: 'Anonymous',
      resources: [{ name: 'myfolder/child', type: 'folder' }]
    })

    // And "Anonymous" uploads the following resources in public link page
    //   | resource | type   |
    //   | PARENT   | folder |
    await ui.userUploadsResourcesInPublicLink({
      world,
      stepUser: 'Anonymous',
      resources: [{ name: 'PARENT', type: 'folder' }]
    })
    // And "Anonymous" should see the resource "PARENT" in the files list
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Anonymous',
      resources: ['PARENT']
    })
    // And "Anonymous" moves the following resource using drag-drop
    //   | resource      | to        |
    //   | new-lorem.txt | SubFolder |
    await ui.userMovesResources({
      world,
      stepUser: 'Anonymous',
      actionType: 'drag-drop',
      resources: [{ resource: 'new-lorem.txt', to: 'SubFolder' }]
    })
    // And "Anonymous" copies the following resource using sidebar-panel
    //   | resource  | to       |
    //   | lorem.txt | myfolder |
    await ui.userCopiesResources({
      world,
      stepUser: 'Anonymous',
      actionType: 'sidebar-panel',
      resources: [{ resource: 'lorem.txt', to: 'myfolder' }]
    })
    // And "Anonymous" renames the following public link resources
    //   | resource     | as               |
    //   | lorem.txt    | lorem_new.txt    |
    //   | textfile.txt | textfile_new.txt |
    await ui.userRenamesPublicLinkResources({
      world,
      stepUser: 'Anonymous',
      resources: [
        { resource: 'lorem.txt', newName: 'lorem_new.txt' },
        { resource: 'textfile.txt', newName: 'textfile_new.txt' }
      ]
    })
    // And "Anonymous" deletes the following resources from public link using batch action
    //   | resource  | from     |
    //   | lorem.txt | myfolder |
    //   | child     | myfolder |
    await ui.userDeletesResourcesFromPublicLink({
      world,
      stepUser: 'Anonymous',
      actionType: 'BATCH_ACTION',
      resources: [
        { resource: 'lorem.txt', parentFolder: 'myfolder' },
        { resource: 'child', parentFolder: 'myfolder' }
      ]
    })
    // And "Alice" removes the public link named "myPublicLink" of resource "folderPublic"
    await ui.userRemovesThePublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'myPublicLink'
    })
    // And "Anonymous" should not be able to open the old link "myPublicLink"
    await ui.userShouldNotBeAbleToOpenTheOldLink({
      world,
      stepUser: 'Anonymous',
      linkName: 'myPublicLink'
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
