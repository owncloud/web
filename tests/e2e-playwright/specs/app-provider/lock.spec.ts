import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { applications } from '../../support/constants'

test.describe('lock', { tag: '@sse' }, () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    //   | Carol |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian', 'Carol']
    })
    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
  })

  test('file lock indication', async ({ world }) => {
    // When "Alice" creates the following resources
    //   | resource | type         | content      |
    //   | test.odt | OpenDocument | some content |
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'test.odt', type: 'OpenDocument', content: 'some content' }]
    })
    // And "Alice" shares the following resource using API
    // | resource | recipient | type | role                                | resourceType |
    // | test.odt | Brian     | user | Can edit with versions and trashbin | file         |
    await api.userHasSharedResources({
      world,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'test.odt',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with versions and trashbin',
          resourceType: 'file'
        }
      ]
    })
    // And "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    // And "Brian" navigates to the shared with me page
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    // When "Brian" opens the following file in Collabora
    //   | resource |
    //   | test.odt |
    await ui.userOpensResourceInViewer({
      world,
      stepUser: 'Brian',
      resource: 'test.odt',
      application: applications.collabora
    })
    // Then "Brian" should see the content "some content" in editor "Collabora"
    await ui.userShouldSeeContentInEditor({
      world,
      stepUser: 'Brian',
      expectedContent: 'some content',
      editor: 'Collabora'
    })

    // file-locked
    // And "Alice" should get "file-locked" SSE event
    await ui.userShouldGetSSEEvent({
      world,
      stepUser: 'Alice',
      event: 'file-locked'
    })
    // And for "Alice" file "test.odt" should be locked
    await ui.resourceShouldBeLockedForUser({
      world,
      stepUser: 'Alice',
      resource: 'test.odt'
    })

    // checking that user cannot 'move', 'rename', 'delete' locked file
    // And "Alice" should not be able to edit file "test.odt"
    await ui.userShouldNotBeAbleToEditResource({
      world,
      stepUser: 'Alice',
      resource: 'test.odt'
    })

    // checking that user cannot delete or change share of the locked file
    // https://github.com/owncloud/web/issues/10507
    // And "Alice" should not be able to manage share of a file "test.odt" for user "Brian"
    await ui.userShouldNotBeAbleToManageShareOfFile({
      world,
      stepUser: 'Alice',
      resource: 'test.odt',
      recipient: 'Brian'
    })

    // checking that sharing and creating link of the locked file is possible
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource | password |
    //   | test.odt | %public% |
    await ui.userCreatesPublicLink({
      world,
      stepUser: 'Alice',
      resource: 'test.odt',
      password: '%public%'
    })
    // And "Alice" shares the following resource using the sidebar panel
    //   | resource | recipient | type | role     | resourceType |
    //   | test.odt | Carol     | user | Can view | file         |
    await ui.userSharesResources({
      world,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      shares: [
        {
          resource: 'test.odt',
          recipient: 'Carol',
          type: 'user',
          role: 'Can view',
          resourceType: 'file'
        }
      ]
    })

    // file-unlocked
    // When "Brian" closes the file viewer
    await ui.userClosesFileViewer({
      world,
      stepUser: 'Brian'
    })
    // Then "Alice" should get "file-unlocked" SSE event
    await ui.userShouldGetSSEEvent({
      world,
      stepUser: 'Alice',
      event: 'file-unlocked'
    })
    // And for "Alice" file "test.odt" should not be locked
    await ui.resourceShouldNotBeLockedForUser({
      world,
      stepUser: 'Alice',
      resource: 'test.odt'
    })
    // And "Alice" should be able to manage share of a file "test.odt" for user "Brian"
    await ui.userShouldBeAbleToManageShareOfFile({
      world,
      stepUser: 'Alice',
      resource: 'test.odt',
      recipient: 'Brian'
    })
    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
