import { expect } from '@playwright/test'
import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  SpacesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('server sent events', { tag: '@sse' }, () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const spacesEnvironment = new SpacesEnvironment()

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
    //   | Brian |
    //   | Carol |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian', 'Carol']
    })
    // // And "Alice" logs in
    // await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test('space sse events', async () => {
    // Given "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" navigates to the projects space page
    await ui.navigateToSpacesPage({ actorsEnvironment, stepUser: 'Brian' })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates the following project space using API
    //   | name      | id        |
    //   | Marketing | marketing |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'Marketing',
      id: 'marketing'
    })
    //  space-member-added
    // When "Alice" adds the following members to the space "Marketing" using API
    //   | user  | role     | shareType |
    //   | Brian | Can view | user      |
    await api.userHasAddedMembersToSpace({
      usersEnvironment,
      stepUser: 'Alice',
      space: 'Marketing',
      sharee: 'Brian',
      role: 'Can view',
      shareType: 'user'
    })
    // Then "Alice" should get "space-member-added" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'space-member-added'
    })
    // And "Brian" should get "userlog-notification" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'userlog-notification'
    })
    // And "Brian" should get "space-member-added" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'space-member-added'
    })
    // And "Brian" should see space "marketing"
    await ui.userShouldSeeSpace({
      actorsEnvironment,
      stepUser: 'Brian',
      space: 'marketing'
    })

    // folder-created
    // When "Brian" navigates to the project space "marketing"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Brian', space: 'marketing' })
    // And "Alice" creates the following folder in space "Marketing" using API
    //   | name         |
    //   | space-folder |
    await api.userHasCreatedFoldersInSpace({
      usersEnvironment,
      stepUser: 'Alice',
      spaceName: 'Marketing',
      folders: ['space-folder']
    })
    // Then "Alice" should get "folder-created" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'folder-created'
    })
    // And "Brian" should get "folder-created" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'folder-created'
    })
    // And following resources should be displayed in the files list for user "Brian"
    //   | resource     |
    //   | space-folder |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['space-folder']
    })
    // And "Brian" should not be able to edit folder "space-folder"
    await ui.userShouldNotAbleToEditResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'space-folder'
    })

    // space-share-updated
    // When "Alice" navigates to the project space "marketing"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'marketing' })
    // And "Alice" changes the roles of the following users in the project space
    //   | user  | role     |
    //   | Brian | Can edit |
    await ui.userChangesMemberRole({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      role: 'Can edit',
      sharee: 'Brian'
    })
    // Then "Alice" should get "space-share-updated" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'space-share-updated'
    })
    // And "Brian" should get "space-share-updated" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'space-share-updated'
    })
    // And "Brian" should be able to edit folder "space-folder"
    await ui.userShouldAbleToEditResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'space-folder'
    })

    // share-created
    // When "Alice" shares the following resource using the sidebar panel
    //   | resource     | recipient | type | role     | resourceType |
    //   | space-folder | Carol     | user | Can view | folder       |
    await ui.userSharesResources({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      shares: [
        {
          resource: 'space-folder',
          recipient: 'Carol',
          type: 'user',
          role: 'Can view',
          resourceType: 'folder'
        }
      ]
    })

    // Then "Alice" should get "share-created" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'share-created'
    })
    // And "Brian" should get "share-created" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'share-created'
    })

    // And "Brian" closes the sidebar
    await ui.userClosesSidebar({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" should see user-direct indicator on the folder "space-folder"
    await ui.userShouldSeeShareIndicatorOnResource({
      actorsEnvironment,
      stepUser: 'Brian',
      buttonLabel: 'user-direct',
      resource: 'space-folder'
    })

    // share-updated
    // When "Alice" updates following sharee role
    //   | resource     | recipient | type | role     | resourceType |
    //   | space-folder | Carol     | user | Can view | folder       |
    await ui.userUpdatesShareeRole({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'space-folder',
      recipient: 'Carol',
      type: 'user',
      role: 'Can view',
      resourceType: 'folder'
    })
    // Then "Alice" should get "share-updated" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'share-updated'
    })
    // And "Brian" should get "share-updated" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'share-updated'
    })

    // # link-created
    // When "Alice" creates a public link of following resource using the sidebar panel
    //   | resource     | password |
    //   | space-folder | %public% |
    await ui.userCreatePublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'space-folder',
      password: '%public%'
    })
    // Then "Alice" should get "link-created" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'link-created'
    })
    // Then "Brian" should get "link-created" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'link-created'
    })
    // And "Brian" should see link-direct indicator on the folder "space-folder"
    await ui.userShouldSeeShareIndicatorOnResource({
      actorsEnvironment,
      stepUser: 'Brian',
      buttonLabel: 'link-direct',
      resource: 'space-folder'
    })

    // # link-updated
    // When "Alice" renames the most recently created public link of resource "space-folder" to "myLink"
    // Then "Alice" should get "link-updated" SSE event
    // And "Brian" should get "link-updated" SSE event

    // # share-removed
    // When "Alice" removes following sharee
    //   | resource     | recipient |
    //   | space-folder | Carol     |
    // Then "Alice" should get "share-removed" SSE event
    // And "Brian" should get "share-removed" SSE event
    // And "Brian" should not see user-direct indicator on the folder "space-folder"

    // # link-removed
    // When "Alice" removes the public link named "myLink" of resource "space-folder"
    // Then "Alice" should get "link-removed" SSE event
    // And "Brian" should get "link-removed" SSE event
    // And "Brian" should not see link-direct indicator on the folder "space-folder"

    // # space-member-removed
    // When "Brian" navigates to the projects space page
    // And "Alice" navigates to the project space "marketing"
    // And "Alice" removes access to following users from the project space
    //   | user  |
    //   | Brian |
    // Then "Alice" should get "space-member-removed" SSE event
    // And "Brian" should get "space-member-removed" SSE event
    // And "Brian" should not see space "marketing"

    // And "Brian" logs out
    // And "Alice" logs out

    // // When "Alice" creates the following resources
    // //   | resource | type         | content      |
    // //   | test.odt | OpenDocument | some content |
    // await api.userHasCreatedFiles({
    //   usersEnvironment,
    //   stepUser: 'Alice',
    //   files: [{ pathToFile: 'test.odt', content: 'some content' }]
    // })
    // // And "Alice" shares the following resource using API
    // // | resource | recipient | type | role                                | resourceType |
    // // | test.odt | Brian     | user | Can edit with versions and trashbin | file         |
    // await api.userHasSharedResources({
    //   usersEnvironment,
    //   stepUser: 'Alice',
    //   shares: [
    //     {
    //       resource: 'test.odt',
    //       recipient: 'Brian',
    //       type: 'user',
    //       role: 'Can edit with versions and trashbin',
    //       resourceType: 'file'
    //     }
    //   ]
    // })
    // // And "Brian" logs in
    // await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // // And "Brian" navigates to the shared with me page
    // await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // // When "Brian" opens the following file in Collabora
    // //   | resource |
    // //   | test.odt |
    // await ui.openResourceInViewer({
    //   actorsEnvironment,
    //   stepUser: 'Brian',
    //   resource: 'test.odt',
    //   application: 'Collabora'
    // })
    // // Then "Brian" should see the content "some content" in editor "Collabora"
    // await ui.userShouldSeeContentInEditor({
    //   actorsEnvironment,
    //   stepUser: 'Brian',
    //   expectedContent: 'some content',
    //   editor: 'Collabora'
    // })

    // // file-locked
    // // And "Alice" should get "file-locked" SSE event
    // await ui.userShouldGetSSEEvent({
    //   usersEnvironment,
    //   stepUser: 'Alice',
    //   event: 'file-locked'
    // })
    // // And for "Alice" file "test.odt" should be locked
    // await ui.resourceShouldBeLocked({
    //   actorsEnvironment,
    //   stepUser: 'Alice',
    //   resource: 'test.odt'
    // })

    // // checking that user cannot 'move', 'rename', 'delete' locked file
    // // And "Alice" should not be able to edit file "test.odt"
    // expect(
    //   await ui.isAbleToEditFileOrFolder({
    //     actorsEnvironment,
    //     stepUser: 'Alice',
    //     resource: 'test.odt'
    //   })
    // ).toBeFalsy()

    // // checking that user cannot delete or change share of the locked file
    // // https://github.com/owncloud/web/issues/10507
    // // And "Alice" should not be able to manage share of a file "test.odt" for user "Brian"
    // await ui.userShouldNotBeAbleToManageShareOfFile({
    //   actorsEnvironment,
    //   usersEnvironment,
    //   stepUser: 'Alice',
    //   resource: 'test.odt',
    //   recipient: 'Brian'
    // })

    // // checking that sharing and creating link of the locked file is possible
    // // And "Alice" creates a public link of following resource using the sidebar panel
    // //   | resource | password |
    // //   | test.odt | %public% |
    // await ui.createPublicLink({
    //   actorsEnvironment,
    //   stepUser: 'Alice',
    //   resource: 'test.odt',
    //   password: '%public%'
    // })
    // // And "Alice" shares the following resource using the sidebar panel
    // //   | resource | recipient | type | role     | resourceType |
    // //   | test.odt | Carol     | user | Can view | file         |
    // await ui.userSharesResources({
    //   actorsEnvironment,
    //   usersEnvironment,
    //   stepUser: 'Alice',
    //   actionType: 'SIDEBAR_PANEL',
    //   shares: [
    //     {
    //       resource: 'test.odt',
    //       recipient: 'Carol',
    //       type: 'user',
    //       role: 'Can view',
    //       resourceType: 'file'
    //     }
    //   ]
    // })

    // // file-unlocked
    // // When "Brian" closes the file viewer
    // await ui.userClosesFileViewer({
    //   actorsEnvironment,
    //   stepUser: 'Brian'
    // })
    // // Then "Alice" should get "file-unlocked" SSE event
    // await ui.userShouldGetSSEEvent({
    //   usersEnvironment,
    //   stepUser: 'Alice',
    //   event: 'file-unlocked'
    // })
    // // And for "Alice" file "test.odt" should not be locked
    // await ui.resourceShouldNotBeLocked({
    //   actorsEnvironment,
    //   stepUser: 'Alice',
    //   resource: 'test.odt'
    // })
    // // And "Alice" should be able to manage share of a file "test.odt" for user "Brian"
    // await ui.userShouldBeAbleToManageShareOfFile({
    //   actorsEnvironment,
    //   usersEnvironment,
    //   stepUser: 'Alice',
    //   resource: 'test.odt',
    //   recipient: 'Brian'
    // })
    // // And "Brian" logs out
    // await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    // // And "Alice" logs out
    // await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
