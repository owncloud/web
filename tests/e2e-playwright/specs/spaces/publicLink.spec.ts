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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Carol' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'David' })

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
    await api.userHasCreatedFolderInSpace({
      usersEnvironment,
      stepUser: 'Alice',
      spaceName: 'team',
      folder: 'spaceFolder/subFolder'
    })

    // And "Alice" creates the following file in space "team" using API
    //   | name                                  | content   |
    //   | spaceFolder/shareToBrian.txt          | some text |
    //   | spaceFolder/subFolder/shareToBrian.md | readme    |
    await api.createFileInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      fileName: 'spaceFolder/shareToBrian.txt',
      space: 'team',
      content: 'some text'
    })
    await api.createFileInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      fileName: 'spaceFolder/subFolder/shareToBrian.md',
      space: 'team',
      content: 'readme'
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

    // And "Alice" creates a public link for the space with password "%public%" using the sidebar panel
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'parent',
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
    await api.createFileInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      fileName: 'example.txt',
      space: 'team'
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
    await ui.userEditsMostRecentlyCreatedPublicLinkSpace({
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
    await ui.anonymousUserUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Anonymous'
    })

    // And "Anonymous" downloads the following public link resources using the sidebar panel
    //   | resource    | type |
    //   | example.txt | file |

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
      resource: 'renamed.txt',
      content: 'new content'
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

    // Then
  })
})
