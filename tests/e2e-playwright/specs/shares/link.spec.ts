import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment,
  LinksEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('link', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const filesEnvironment = new FilesEnvironment()
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

    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })
  })

  test('public link', { tag: '@predefined-users' }, async () => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Brian |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Brian']
    })

    //  And "Alice" creates the following folders in personal space using API
    //   | name                   |
    //   | folderPublic           |
    //   | folderPublic/SubFolder |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['folderPublic', 'folderPublic/SubFolder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile             | content     |
    //   | folderPublic/lorem.txt | lorem ipsum |
    await api.userHasCreatedFiles({
      usersEnvironment,
      stepUser: 'Alice',
      files: [{ pathToFile: 'folderPublic/lorem.txt', content: 'lorem ipsum' }]
    })

    // When "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource     | role             | password |
    //   | folderPublic | Secret File Drop | %public% |
    await ui.userCreatesPublicLinkUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      role: 'Secret File Drop',
      password: '%public%'
    })
    // And "Alice" renames the most recently created public link of resource "folderPublic" to "myPublicLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      newName: 'myPublicLink'
    })
    // And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "Secret File Drop"
    await ui.userChangesRoleOfThePublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'myPublicLink',
      newRole: 'Secret File Drop'
    })
    // And "Alice" sets the expiration date of the public link named "myPublicLink" of resource "folderPublic" to "+5 days"
    await ui.userSetsExpirationDateOfThePublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'myPublicLink',
      expireDate: '+5 days'
    })
    // When "Anonymous" opens the public link "myPublicLink"
    await ui.userOpensPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'myPublicLink'
    })
    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Anonymous'
    })
    // And "Anonymous" drop uploads following resources
    //   | resource     |
    //   | textfile.txt |
    await ui.userDropUploadsResources({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Anonymous',
      resources: ['textfile.txt']
    })

    // authenticated user
    // When "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" opens the public link "myPublicLink"
    await ui.userOpensPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Brian',
      name: 'myPublicLink'
    })
    // And "Brian" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Brian'
    })
    // And "Brian" drop uploads following resources
    //   | resource   |
    //   | simple.pdf |
    await ui.userDropUploadsResources({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resources: ['simple.pdf']
    })

    //   When "Alice" opens folder "folderPublic"
    await ui.userOpensResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource     |
    //   | textfile.txt |
    //   | simple.pdf   |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['textfile.txt', 'simple.pdf']
    })
    // And "Alice" opens the "files" app
    await ui.userOpensApplication({
      actorsEnvironment,
      stepUser: 'Alice',
      name: 'files'
    })
    // And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "Can edit"
    await ui.userChangesRoleOfThePublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'myPublicLink',
      newRole: 'Can edit'
    })
    // And "Brian" refreshes the old link
    await ui.userRefreshesTheOldLink({ actorsEnvironment, stepUser: 'Brian' })

    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource     |
    //   | textfile.txt |
    //   | simple.pdf   |
    //   | SubFolder    |
    //   | lorem.txt    |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['textfile.txt', 'simple.pdf', 'SubFolder', 'lorem.txt']
    })
    // And "Brian" deletes the following resources from public link using sidebar panel
    //   | resource   |
    //   | simple.pdf |
    await ui.userDeletesResourcesFromPublicLink({
      actorsEnvironment,
      stepUser: 'Brian',
      actionType: 'SIDEBAR_PANEL',
      resources: [{ resource: 'simple.pdf' }]
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })

    // And "Anonymous" refreshes the old link
    await ui.userRefreshesTheOldLink({ actorsEnvironment, stepUser: 'Anonymous' })
    // And "Anonymous" downloads the following public link resources using the sidebar panel
    //   | resource     | type |
    //   | lorem.txt    | file |
    //   | textfile.txt | file |
    await ui.userDownloadsThePublicLinkResources({
      actorsEnvironment,
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
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Anonymous',
      resources: [{ name: 'new-lorem.txt' }, { name: 'lorem.txt', option: 'replace' }]
    })
    // And "Anonymous" creates the following resources
    //   | resource       | type   |
    //   | myfolder/child | folder |
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Anonymous',
      resources: [{ name: 'myfolder/child', type: 'folder' }]
    })

    // And "Anonymous" uploads the following resources in public link page
    //   | resource | type   |
    //   | PARENT   | folder |
    await ui.userUploadsResourcesInPublicLink({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Anonymous',
      resources: [{ name: 'PARENT', type: 'folder' }]
    })
    // And "Anonymous" should see the resource "PARENT" in the files list
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Anonymous',
      resources: ['PARENT']
    })
    // And "Anonymous" moves the following resource using drag-drop
    //   | resource      | to        |
    //   | new-lorem.txt | SubFolder |
    await ui.userMovesResource({
      actorsEnvironment,
      stepUser: 'Anonymous',
      actionType: 'drag-drop',
      resources: [{ resource: 'new-lorem.txt', to: 'SubFolder' }]
    })
    // And "Anonymous" copies the following resource using sidebar-panel
    //   | resource  | to       |
    //   | lorem.txt | myfolder |
    await ui.userCopiesResource({
      actorsEnvironment,
      stepUser: 'Anonymous',
      actionType: 'sidebar-panel',
      resources: [{ resource: 'lorem.txt', to: 'myfolder' }]
    })
    // And "Anonymous" renames the following public link resources
    //   | resource     | as               |
    //   | lorem.txt    | lorem_new.txt    |
    //   | textfile.txt | textfile_new.txt |
    await ui.userRenamesPublicLinkResources({
      actorsEnvironment,
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
      actorsEnvironment,
      stepUser: 'Anonymous',
      actionType: 'BATCH_ACTION',
      resources: [
        { resource: 'lorem.txt', parentFolder: 'myfolder' },
        { resource: 'child', parentFolder: 'myfolder' }
      ]
    })
    // And "Alice" removes the public link named "myPublicLink" of resource "folderPublic"
    await ui.userRemovesThePublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'myPublicLink'
    })
    // And "Anonymous" should not be able to open the old link "myPublicLink"
    await ui.userShouldNotBeAbleToOpenTheOldLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      linkName: 'myPublicLink'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
