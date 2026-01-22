import { expect, test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('lock', { tag: '@sse' }, () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()

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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Carol' })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
  })

  test('file lock indication', async () => {
    // When "Alice" creates the following resources
    //   | resource | type         | content      |
    //   | test.odt | OpenDocument | some content |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'test.odt',
      type: 'OpenDocument',
      content: 'some content'
    })
    // And "Alice" shares the following resource using API
    //   | resource | recipient | type | role     | resourceType |
    //   | test.odt | Brian     | user | Can edit | file         |
    await api.userHasSharedResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'test.odt',
      recipient: 'Brian',
      type: 'user',
      role: 'Can edit',
      resourceType: 'file'
    })
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // When "Brian" opens the following file in Collabora
    //   | resource |
    //   | test.odt |
    await ui.userOpensFileInViewer({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'test.odt',
      actionType: 'Collabora'
    })
    // Then "Brian" should see the content "some content" in editor "Collabora"
    await ui.userShouldSeeContentInEditor({
      actorsEnvironment,
      stepUser: 'Brian',
      expectedContent: 'some content',
      editor: 'Collabora'
    })

    // file-locked
    // And "Alice" should get "file-locked" SSE event
    await api.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'file-locked'
    })
    // And for "Alice" file "test.odt" should be locked
    expect(
      await ui.resourceShouldBeLocked({
        actorsEnvironment,
        stepUser: 'Alice',
        resource: 'test.odt'
      })
    ).toBeTruthy()

    // checking that user cannot 'move', 'rename', 'delete' locked file
    // And "Alice" should not be able to edit file "test.odt"
    expect(
      await ui.isAbleToEditFileOrFolder({
        actorsEnvironment,
        stepUser: 'Alice',
        resource: 'test.odt'
      })
    ).toBeFalsy()

    // checking that user cannot delete or change share of the locked file
    // https://github.com/owncloud/web/issues/10507
    // And "Alice" should not be able to manage share of a file "test.odt" for user "Brian"
    expect(
      await ui.userShouldBeAbleToManageShareOfFile({
        actorsEnvironment,
        usersEnvironment,
        stepUser: 'Alice',
        resource: 'test.odt',
        recipient: 'Brian'
      })
    ).toBeFalsy()

    // checking that sharing and creating link of the locked file is possible
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource | password |
    //   | test.odt | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'test.odt',
      password: '%public%'
    })
    // And "Alice" shares the following resource using the sidebar panel
    //   | resource | recipient | type | role     | resourceType |
    //   | test.odt | Carol     | user | Can view | file         |
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'test.odt',
      recipient: 'Carol',
      type: 'user',
      role: 'Can view',
      actionType: 'SIDEBAR_PANEL',
      resourceType: 'file'
    })

    // file-unlocked
    // When "Brian" closes the file viewer
    await ui.userClosesTextEditor({
      actorsEnvironment,
      stepUser: 'Brian'
    })
    // Then "Alice" should get "file-unlocked" SSE event
    await api.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'file-unlocked'
    })
    // And for "Alice" file "test.odt" should not be locked
    expect(
      await ui.resourceShouldBeLocked({
        actorsEnvironment,
        stepUser: 'Alice',
        resource: 'test.odt'
      })
    ).toBeFalsy()
    // And "Alice" should be able to manage share of a file "test.odt" for user "Brian"
    expect(
      await ui.userShouldBeAbleToManageShareOfFile({
        actorsEnvironment,
        usersEnvironment,
        stepUser: 'Alice',
        resource: 'test.odt',
        recipient: 'Brian'
      })
    ).toBeTruthy()
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
