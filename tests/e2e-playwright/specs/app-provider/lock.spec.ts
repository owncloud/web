import { expect } from '@playwright/test'
import { test } from '../../support/test'
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
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian', 'Carol']
    })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test('file lock indication', async () => {
    // When "Alice" creates the following resources
    //   | resource | type         | content      |
    //   | test.odt | OpenDocument | some content |
    await api.userHasCreatedFiles({
      usersEnvironment,
      stepUser: 'Alice',
      files: [{ pathToFile: 'test.odt', content: 'some content' }]
    })
    // And "Alice" shares the following resource using API
    // | resource | recipient | type | role                                | resourceType |
    // | test.odt | Brian     | user | Can edit with versions and trashbin | file         |
    await api.userHasSharedResources({
      usersEnvironment,
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
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // When "Brian" opens the following file in Collabora
    //   | resource |
    //   | test.odt |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'test.odt',
      application: 'Collabora'
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
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'file-locked'
    })
    // And for "Alice" file "test.odt" should be locked
    await ui.resourceShouldBeLocked({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'test.odt'
    })

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
    await ui.userShouldNotBeAbleToManageShareOfFile({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'test.odt',
      recipient: 'Brian'
    })

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
    await ui.userSharesResources({
      actorsEnvironment,
      usersEnvironment,
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
      actorsEnvironment,
      stepUser: 'Brian'
    })
    // Then "Alice" should get "file-unlocked" SSE event
    await ui.userShouldGetSSEEvent({
      usersEnvironment,
      stepUser: 'Alice',
      event: 'file-unlocked'
    })
    // And for "Alice" file "test.odt" should not be locked
    await ui.resourceShouldNotBeLocked({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'test.odt'
    })
    // And "Alice" should be able to manage share of a file "test.odt" for user "Brian"
    await ui.userShouldBeAbleToManageShareOfFile({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'test.odt',
      recipient: 'Brian'
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
