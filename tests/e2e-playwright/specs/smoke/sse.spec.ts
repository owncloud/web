import { expect } from '@playwright/test'
import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  SpacesEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('server sent events', { tag: '@sse' }, () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
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
    await ui.userNavigatesToSpace({ actorsEnvironment, stepUser: 'Brian', space: 'marketing' })
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
    await ui.userNavigatesToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'marketing' })
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
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'space-folder',
      newName: 'myLink'
    })
    // Then "Alice" should get "link-updated" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'link-updated'
    })
    // And "Brian" should get "link-updated" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'link-updated'
    })

    // share-removed
    // When "Alice" removes following sharee
    //   | resource     | recipient |
    //   | space-folder | Carol     |
    await ui.userRemovesSharee({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'space-folder',
      recipient: 'Carol'
    })
    // Then "Alice" should get "share-removed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'share-removed'
    })
    // And "Brian" should get "share-removed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'share-removed'
    })
    // And "Brian" should not see user-direct indicator on the folder "space-folder"
    await ui.userShouldNotSeeShareIndicatorOnResource({
      actorsEnvironment,
      stepUser: 'Brian',
      buttonLabel: 'user-direct',
      resource: 'space-folder'
    })

    // link-removed
    // When "Alice" removes the public link named "myLink" of resource "space-folder"
    await ui.userRemovesThePublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      publicLinkName: 'myLink',
      resource: 'space-folder'
    })
    // Then "Alice" should get "link-removed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'link-removed'
    })
    // And "Brian" should get "link-removed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'link-removed'
    })
    // And "Brian" should not see link-direct indicator on the folder "space-folder"
    await ui.userShouldNotSeeShareIndicatorOnResource({
      actorsEnvironment,
      stepUser: 'Brian',
      buttonLabel: 'link-direct',
      resource: 'space-folder'
    })

    // # space-member-removed
    // When "Brian" navigates to the projects space page
    await ui.navigateToSpacesPage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Alice" navigates to the project space "marketing"
    await ui.userNavigatesToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'marketing' })
    // And "Alice" removes access to following users from the project space
    //   | user  |
    //   | Brian |
    await ui.removeAccessToMember({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      reciver: 'Brian',
      role: 'Can edit with trashbin'
    })
    // Then "Alice" should get "space-member-removed" SSE event
    // And "Brian" should get "space-member-removed" SSE event
    // And "Brian" should not see space "marketing"

    // And "Brian" logs out
    // And "Alice" logs out
  })

  test('share sse events', async () => {
    // When "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates the following folder in personal space using API
    //   | name                   |
    //   | sharedFolder/subFolder |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['sharedFolder/subFolder']
    })

    // share-created
    // When "Alice" shares the following resource using the sidebar panel
    //   | resource     | recipient | type | role     | resourceType |
    //   | sharedFolder | Brian     | user | Can view | folder       |
    await ui.userSharesResources({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      shares: [
        {
          resource: 'sharedFolder',
          recipient: 'Brian',
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
    // And "Brian" should not be able to edit folder "sharedFolder"
    await ui.userShouldNotAbleToEditResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'sharedFolder'
    })

    // share-updated
    // When "Alice" updates following sharee role
    //   | resource     | recipient | type | role                   | resourceType |
    //   | sharedFolder | Brian     | user | Can edit with trashbin | folder       |
    await ui.userUpdatesShareeRole({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'sharedFolder',
      recipient: 'Brian',
      type: 'user',
      role: 'Can edit with trashbin',
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
    // And "Brian" opens folder "sharedFolder"
    await ui.userOpensResources({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'sharedFolder'
    })
    // And "Brian" should be able to edit folder "subFolder"
    await ui.userShouldAbleToEditResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'subFolder'
    })

    // share-removed
    // When "Alice" removes following sharee
    //   | resource     | recipient |
    //   | sharedFolder | Brian     |
    await ui.userRemovesSharee({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'sharedFolder',
      recipient: 'Brian'
    })

    // Then "Alice" should get "share-removed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'share-removed'
    })
    // And "Brian" should get "share-removed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'share-removed'
    })
    // And "Brian" should see the message "Your access to this share has been revoked. Please navigate to another location." on the webUI
    await ui.userShouldSeeMessageOnWebUI({
      actorsEnvironment,
      stepUser: 'Brian',
      message: 'Your access to this share has been revoked. Please navigate to another location.'
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })

  test('sse events on file operations', async () => {
    // Given "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })
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
    // And "Alice" adds the following members to the space "Marketing" using API
    //   | user  | role                   | shareType |
    //   | Brian | Can edit with trashbin | user      |
    await api.userHasAddedMembersToSpace({
      usersEnvironment,
      stepUser: 'Alice',
      space: 'Marketing',
      shareType: 'user',
      role: 'Can edit with trashbin',
      sharee: 'Brian'
    })
    // And "Alice" creates the following folder in space "Marketing" using API
    //   | name         |
    //   | space-folder |
    await api.userHasCreatedFoldersInSpace({
      usersEnvironment,
      stepUser: 'Alice',
      spaceName: 'Marketing',
      folders: ['space-folder']
    })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // When "Alice" navigates to the project space "marketing"
    await ui.userNavigatesToSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      space: 'Marketing'
    })

    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" navigates to the project space "marketing"
    await ui.userNavigatesToSpace({
      actorsEnvironment,
      stepUser: 'Brian',
      space: 'Marketing'
    })

    // postprocessing-finished - upload file
    // When "Brian" uploads the following resources
    //   | resource   |
    //   | simple.pdf |
    await ui.userUploadsResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resources: [{ name: 'simple.pdf', to: 'space-folder' }]
    })
    // Then "Brian" should get "postprocessing-finished" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'postprocessing-finished'
    })
    // And "Alice" should get "postprocessing-finished" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'postprocessing-finished'
    })
    // And following resources should be displayed in the files list for user "Alice"
    //   | resource   |
    //   | simple.pdf |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['simple.pdf']
    })

    // postprocessing-finished - create file
    // file-touched -create file
    // When "Alice" creates the following resources
    //   | resource    | type    | content   |
    //   | example.txt | txtFile | some text |
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [{ name: 'example.txt', type: 'txtFile', content: 'some text' }]
    })
    // Then "Alice" should get "postprocessing-finished" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'postprocessing-finished'
    })
    // And "Alice" should get "file-touched" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'file-touched'
    })
    // And "Brian" should get "postprocessing-finished" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'postprocessing-finished'
    })
    // And "Brian" should get "file-touched" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'file-touched'
    })
    // And following resources should be displayed in the files list for user "Brian"
    //   | resource    |
    //   | example.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['example.txt']
    })

    // item-renamed
    // When "Brian" renames the following resource
    //   | resource   | as                 |
    //   | simple.pdf | simple-renamed.pdf |
    await ui.userRenamesResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'simple.pdf',
      newResourceName: 'simple-renamed.pdf'
    })
    // Then "Brian" should get "item-renamed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'item-renamed'
    })
    // And "Alice" should get "item-renamed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'item-renamed'
    })
    // And following resources should be displayed in the files list for user "Alice"
    //   | resource           |
    //   | simple-renamed.pdf |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['simple-renamed.pdf']
    })

    // item-trashed
    // When "Alice" deletes the following resource using the sidebar panel
    //   | resource    |
    //   | example.txt |
    await ui.userDeletesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resources: [{ name: 'example.txt' }]
    })
    // Then "Alice" should get "item-trashed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'item-trashed'
    })
    // And "Brian" should get "item-trashed" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'item-trashed'
    })
    // And following resources should not be displayed in the files list for user "Brian"
    //   | resource    |
    //   | example.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['example.txt']
    })

    // item-restored
    // When "Brian" navigates to the trashbin of the project space "marketing"
    await ui.userNavigatesToSpace({
      actorsEnvironment,
      stepUser: 'Brian',
      space: 'Marketing'
    })
    // And "Brian" restores the following resources from trashbin
    //   | resource    |
    //   | example.txt |
    // Then "Brian" should get "item-restored" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Brian',
      event: 'item-restored'
    })
    // And "Alice" should get "item-restored" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'item-restored'
    })
    // And following resources should be displayed in the files list for user "Alice"
    //   | resource    |
    //   | example.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['example.txt']
    })

    // # item-moved
    // When "Brian" navigates to the project space "marketing"
    // And "Brian" opens folder "space-folder"
    // And "Alice" moves the following resource using drag-drop
    //   | resource           | to           |
    //   | simple-renamed.pdf | space-folder |
    // Then "Alice" should get "item-moved" SSE event
    // And "Brian" should get "item-moved" SSE event
    // And following resources should be displayed in the files list for user "Brian"
    //   | resource           |
    //   | simple-renamed.pdf |

    // And "Brian" logs out
    // And "Alice" logs out
  })
})
