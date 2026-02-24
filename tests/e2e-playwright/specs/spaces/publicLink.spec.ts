import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  SpacesEnvironment,
  LinksEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('check files pagination in project space', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const linksEnvironment = new LinksEnvironment()
  const spacesEnvironment = new SpacesEnvironment()
  const filesEnvironment = new FilesEnvironment()

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
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
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
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('public link for space', async () => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    //   | Carol |
    //   | David |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Brian', 'Carol', 'David']
    })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following project space using API
    //   | name | id     |
    //   | team | team.1 |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'sales',
      id: 'sales'
    })

    // And "Alice" creates the following folder in space "team" using API
    //   | name                  |
    //   | spaceFolder/subFolder |
    await api.userHasCreatedFoldersInSpace({
      usersEnvironment,
      stepUser: 'Alice',
      spaceName: 'team',
      folders: ['spaceFolder/subFolder']
    })

    // And "Alice" creates the following file in space "team" using API
    //   | name                                  | content   |
    //   | spaceFolder/shareToBrian.txt          | some text |
    //   | spaceFolder/subFolder/shareToBrian.md | readme    |
    await api.createFilesInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      files: [
        {
          name: 'spaceFolder/shareToBrian.txt',
          space: 'team',
          content: 'some text'
        }
      ]
    })

    await api.createFilesInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      files: [
        {
          name: 'spaceFolder/subFolder/shareToBrian.md',
          space: 'team',
          content: 'readme'
        }
      ]
    })

    // And "Alice" adds the following members to the space "team" using API
    //   | user  | role       | shareType |
    //   | Brian | Can edit   | user      |
    //   | Carol | Can view   | user      |
    //   | David | Can manage | user      |
    await api.userHasAddedMembersToSpace({
      usersEnvironment,
      stepUser: 'Alice',
      space: 'team',
      shareType: 'user',
      sharee: 'Brian',
      role: 'Can edit'
    })
    await api.userHasAddedMembersToSpace({
      usersEnvironment,
      stepUser: 'Alice',
      space: 'team',
      shareType: 'user',
      sharee: 'Carol',
      role: 'Can view'
    })
    await api.userHasAddedMembersToSpace({
      usersEnvironment,
      stepUser: 'Alice',
      space: 'team',
      shareType: 'user',
      sharee: 'David',
      role: 'Can manage'
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" uploads the following resources via drag-n-drop
    //   | resource       |
    //   | simple.pdf     |
    //   | testavatar.jpg |
    await ui.userUploadsResourceViaDragNDrop({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'simple.pdf'
    })
    await ui.userUploadsResourceViaDragNDrop({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'testavatar.jpg'
    })

    // And "Alice" creates a public link for the space with password "%public%" using the sidebar panel
    await ui.createPublicLinkOfSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      password: '%public%'
    })

    // And "Alice" renames the most recently created public link of space to "spaceLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      newName: 'spaceLink'
    })
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource    | password |
    //   | spaceFolder | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'spaceFolder',
      password: '%public%'
    })

    // And "Alice" renames the most recently created public link of resource "spaceFolder" to "folderLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'spaceFolder',
      newName: 'folderLink'
    })

    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource                     | password |
    //   | spaceFolder/shareToBrian.txt | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'spaceFolder/shareToBrian.txt',
      password: '%public%'
    })

    // And "Alice" renames the most recently created public link of resource "spaceFolder/shareToBrian.txt" to "textLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'spaceFolder/shareToBrian.txt',
      newName: 'textLink'
    })

    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource                              | password |
    //   | spaceFolder/subFolder/shareToBrian.md | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'spaceFolder/subFolder/shareToBrian.md',
      password: '%public%'
    })

    // And "Alice" renames the most recently created public link of resource "spaceFolder/subFolder/shareToBrian.md" to "markdownLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'spaceFolder/subFolder/shareToBrian.md',
      newName: 'markdownLink'
    })
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource   | password |
    //   | simple.pdf | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'simple.pdf',
      password: '%public%'
    })
    // And "Alice" renames the most recently created public link of resource "simple.pdf" to "pdfLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'simple.pdf',
      newName: 'pdfLink'
    })
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource       | password |
    //   | testavatar.jpg | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testavatar.jpg',
      password: '%public%'
    })
    // And "Alice" renames the most recently created public link of resource "testavatar.jpg" to "imageLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testavatar.jpg',
      newName: 'imageLink'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    // When "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Brian" opens the public link "spaceLink"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Brian',
      name: 'spaceLink'
    })
    // And "Brian" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Brian'
    })
    // Then "Brian" should not be able to edit the public link named "spaceLink"
    await ui.userShouldNotBeAbleToEditPublicLink({
      actorsEnvironment,
      stepUser: 'Brian',
      linkName: 'spaceLink'
    })
    // And "Brian" should not be able to edit the public link named "folderLink"
    await ui.userShouldNotBeAbleToEditPublicLink({
      actorsEnvironment,
      stepUser: 'Brian',
      linkName: 'folderLink'
    })
    // When "Brian" opens the public link "textLink"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Brian',
      name: 'textLink'
    })
    // And "Brian" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Brian'
    })
    // Then "Brian" is in a text-editor
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Brian',
      fileViewerType: 'text-editor'
    })
    // And "Brian" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Brian' })
    // When "Brian" opens the public link "markdownLink"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Brian',
      name: 'markdownLink'
    })
    // And "Brian" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Brian'
    })
    // Then "Brian" is in a text-editor
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Brian',
      fileViewerType: 'text-editor'
    })
    // And "Brian" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    // When "Carol" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Carol' })
    // And "Carol" opens the public link "spaceLink"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Carol',
      name: 'spaceLink'
    })
    // And "Carol" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Carol'
    })
    // But "Carol" should not be able to edit the public link named "spaceLink"
    await ui.userShouldNotBeAbleToEditPublicLink({
      actorsEnvironment,
      stepUser: 'Carol',
      linkName: 'spaceLink'
    })
    // And "Carol" should not be able to edit the public link named "folderLink"
    await ui.userShouldNotBeAbleToEditPublicLink({
      actorsEnvironment,
      stepUser: 'Carol',
      linkName: 'folderLink'
    })
    // When "Carol" opens the public link "folderLink"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Carol',
      name: 'Unnamed link'
    })
    // And "Carol" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Carol'
    })
    // Then "Carol" should not be able to edit folder "subFolder"
    await ui.userShouldNotBeAbleToEditFileOrFolder({
      actorsEnvironment,
      stepUser: 'Carol',
      resource: 'subFolder'
    })
    // When "Carol" opens the public link "pdfLink"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Carol',
      name: 'Unnamed link'
    })
    // And "Carol" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Carol'
    })
    // Then "Carol" is in a pdf-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Carol',
      fileViewerType: 'pdf-viewer'
    })
    // And "Carol" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Carol' })

    // And "Carol" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Carol' })
    // When "David" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "David" opens the public link "spaceLink"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'spaceLink'
    })
    // And "David" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'David'
    })
    // And "David" edits the public link named "spaceLink" of the space changing role to "Can edit"
    await ui.userEditsPublicLinkOfSpace({
      actorsEnvironment,
      stepUser: 'David',
      linkName: 'spaceLink',
      role: 'Can edit'
    })
    // And "David" edits the public link named "folderLink" of resource "spaceFolder" changing role to "Can edit"
    await ui.userEditsPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'David',
      resource: 'folderLink',
      linkName: 'spaceFolder',
      role: 'Can edit'
    })
    // When "David" opens the public link "imageLink"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'David',
      name: 'imageLink'
    })
    // And "David" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'David'
    })
    // Then "David" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Carol',
      fileViewerType: 'media-viewer'
    })
    // And "David" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'David' })

    // And "David" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'David' })
  })

  test('crud operation to public link for space', async () => {
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following project space using API
    //   | name | id     |
    //   | team | team.1 |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'team',
      id: 'team.1'
    })

    // And "Alice" creates the following file in space "team" using API
    //   | name        | content   |
    //   | example.txt | some text |
    await api.createFilesInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      files: [
        {
          name: 'example.txt',
          space: 'team'
        }
      ]
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" creates a public link for the space with password "%public%" using the sidebar panel
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'parent',
      role: 'Can edit',
      password: '%public%'
    })
    // And "Alice" renames the most recently created public link of space to "spaceLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      newName: 'myPublicLink'
    })
    // And "Alice" edits the public link named "spaceLink" of the space changing role to "Can edit"
    await ui.userEditsPublicLinkOfSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      linkName: 'spaceLink',
      role: 'Can edit'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })

    // When "Anonymous" opens the public link "spaceLink"
    await ui.anonymousUserOpensPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'spaceLink'
    })

    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Anonymous'
    })

    // And "Anonymous" downloads the following public link resources using the sidebar panel
    //   | resource    | type |
    //   | example.txt | file |
    await ui.userDownloadsPublicLinkResource({
      actorsEnvironment,
      stepUser: 'Anonymous',
      actionType: 'SIDEBAR_PANEL',
      resourceToDownload: [{ resource: 'example.txt', type: 'file' }]
    })
    // And "Anonymous" uploads the following resources in public link page
    //   | resource      |
    //   | new-lorem.txt |
    await ui.userUploadsResourceInPublicLink({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Anonymous',
      resource: 'new-lorem.txt',
      to: '',
      option: '',
      type: ''
    })

    // And "Anonymous" renames the following public link resources
    //   | resource    | as          |
    //   | example.txt | renamed.txt |
    await ui.userRenamesResourceOfPublicLink({
      actorsEnvironment,
      stepUser: 'Anonymous',
      resource: 'example.txt',
      newName: 'renamed.txt'
    })

    // And "Anonymous" edits the following resources
    //   | resource    | content     |
    //   | renamed.txt | new content |
    await ui.userEditsFile({
      actorsEnvironment,
      stepUser: 'Anonymous',
      resources: [{ name: 'renamed.txt', content: 'new content' }]
    })

    // When "Anonymous" deletes the following resources using the sidebar panel
    //   | resource      |
    //   | renamed.txt   |
    //   | new-lorem.txt |
    await ui.userDeletesResource({
      actorsEnvironment,
      stepUser: 'Anonymous',
      resource: 'renamed.txt',
      actionType: 'SIDEBAR_PANEL'
    })
    await ui.userDeletesResource({
      actorsEnvironment,
      stepUser: 'Anonymous',
      resource: 'new-lorem.txt',
      actionType: 'SIDEBAR_PANEL'
    })

    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['new-lorem.txt', 'renamed.txt']
    })
  })
})
