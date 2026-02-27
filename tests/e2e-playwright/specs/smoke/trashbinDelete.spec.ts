import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('Trashbin delete', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
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
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('delete files and folders from trashbin', async () => {
    // Given "Alice" creates the following resources
    //   | resource     | type   |
    //   | FOLDER       | folder |
    //   | PARENT/CHILD | folder |
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [
        { name: 'FOLDER', type: 'folder' },
        { name: 'PARENT/CHILD', type: 'folder' }
      ]
    })
    // And "Alice" uploads the following resources
    //   | resource               | to           |
    //   | new-lorem.txt          | FOLDER       |
    //   | PARENT/parent.txt      | PARENT       |
    //   | PARENT/simple.pdf      | PARENT       |
    //   | PARENT/CHILD/child.txt | PARENT/CHILD |
    //   | data.tar.gz            |              |
    //   | lorem.txt              |              |
    //   | lorem-big.txt          |              |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resources: [
        { name: 'new-lorem.txt', to: 'FOLDER' },
        { name: 'PARENT/parent.txt', to: 'PARENT' },
        { name: 'PARENT/simple.pdf', to: 'PARENT' },
        { name: 'PARENT/CHILD/child.txt', to: 'PARENT/CHILD' },
        { name: 'data.tar.gz' },
        { name: 'lorem.txt' },
        { name: 'lorem-big.txt' }
      ]
    })
    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })
    // And "Alice" deletes the following resources using the batch action
    //   | resource      |
    //   | FOLDER        |
    //   | PARENT        |
    //   | data.tar.gz   |
    //   | lorem.txt     |
    //   | lorem-big.txt |
    await ui.userDeletesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      actionType: 'BATCH_ACTION',
      resources: [
        { name: 'FOLDER' },
        { name: 'PARENT' },
        { name: 'data.tar.gz' },
        { name: 'lorem.txt' },
        { name: 'lorem-big.txt' }
      ]
    })
    // And "Alice" navigates to the trashbin
    await ui.navigateToTrashbin({ actorsEnvironment, stepUser: 'Alice' })

    // When "Alice" deletes the following resources from trashbin using the batch action
    //   | resource  |
    //   | lorem.txt |
    //   | PARENT    |
    await ui.userDeletesResourcesFromTrashbinUsingBatchAction({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: ['lorem.txt', 'PARENT']
    })

    // And "Alice" empties the trashbin
    await ui.userEmptiesTrashbin({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })

  test('delete and restore a file inside a received shared folder', async () => {
    // Given "Alice" creates the following folders in personal space using API
    //   | name          |
    //   | folderToShare |
    //   | empty-folder   |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['folderToShare', 'empty-folder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile              | content     |
    //   | folderToShare/lorem.txt | lorem ipsum |
    //   | sample.txt              | sample      |
    await api.userHasCreatedFiles({
      usersEnvironment,
      stepUser: 'Alice',
      files: [
        { pathToFile: 'folderToShare/lorem.txt', content: 'lorem ipsum' },
        { pathToFile: 'sample.txt', content: 'sample' }
      ]
    })
    // And "Alice" shares the following resource using the sidebar panel
    //   | resource      | recipient | type | role                      | resourceType |
    //   | folderToShare | Brian     | user | Can edit without versions | folder       |
    await ui.userSharesResources({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      shares: [
        {
          resource: 'folderToShare',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        }
      ]
    })
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" opens folder "folderToShare"
    await ui.userOpensResources({ actorsEnvironment, stepUser: 'Brian', resource: 'folderToShare' })
    // When "Brian" deletes the following resources using the sidebar panel
    //   | resource  |
    //   | lorem.txt |
    await ui.userDeletesResources({
      actorsEnvironment,
      stepUser: 'Brian',
      actionType: 'SIDEBAR_PANEL',
      resources: [{ name: 'lorem.txt' }]
    })
    // And "Brian" navigates to the trashbin
    await ui.navigateToTrashbin({ actorsEnvironment, stepUser: 'Brian' })
    // Then following resources should not be displayed in the trashbin for user "Brian"
    //   | resource                |
    //   | folderToShare/lorem.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'trashbin',
      stepUser: 'Brian',
      resources: ['folderToShare/lorem.txt']
    })

    // When "Alice" deletes the following resources using the sidebar panel
    //   | resource     |
    //   | sample.txt   |
    //   | empty-folder |
    await ui.userDeletesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resources: [{ name: 'sample.txt' }, { name: 'empty-folder' }]
    })
    // And "Alice" navigates to the trashbin
    await ui.navigateToTrashbin({ actorsEnvironment, stepUser: 'Alice' })
    // Then following resources should be displayed in the trashbin for user "Alice"
    //   | resource                |
    //   | folderToShare/lorem.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'trashbin',
      stepUser: 'Alice',
      resources: ['folderToShare/lorem.txt']
    })
    // And "Alice" restores the following resources from trashbin
    //   | resource                |
    //   | folderToShare/lorem.txt |
    await ui.userRestoresResourcesFromTrashbin({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: ['folderToShare/lorem.txt']
    })
    // And "Alice" restores the following resources from trashbin using the batch action
    //   | resource                |
    //   | sample.txt              |
    //   | empty-folder            |
    await ui.userRestoresResourcesFromTrashbin({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: ['sample.txt', 'empty-folder'],
      actionType: 'BATCH_ACTION'
    })
    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })
    // And "Alice" opens folder "folderToShare"
    await ui.userOpensResources({ actorsEnvironment, stepUser: 'Alice', resource: 'folderToShare' })
    // And following resources should be displayed in the files list for user "Alice"
    //   | resource  |
    //   | lorem.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['lorem.txt']
    })
    // And "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" opens folder "folderToShare"
    await ui.userOpensResources({ actorsEnvironment, stepUser: 'Brian', resource: 'folderToShare' })
    // And following resources should be displayed in the files list for user "Brian"
    //   | resource  |
    //   | lorem.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['lorem.txt']
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
