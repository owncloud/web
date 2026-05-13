import { test } from '../../environment/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { resourcePage, fileAction } from '../../environment/constants'

test.describe('Trashbin delete', () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
  })

  test('delete files and folders from trashbin', async ({ world }) => {
    // Given "Alice" creates the following resources
    //   | resource     | type   |
    //   | FOLDER       | folder |
    //   | PARENT/CHILD | folder |
    await ui.userCreatesResources({
      world,
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
    await ui.userUploadsResources({
      world,
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
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })
    // And "Alice" deletes the following resources using the batch action
    //   | resource      |
    //   | FOLDER        |
    //   | PARENT        |
    //   | data.tar.gz   |
    //   | lorem.txt     |
    //   | lorem-big.txt |
    await ui.userDeletesResources({
      world,
      stepUser: 'Alice',
      actionType: fileAction.batchAction,
      resources: [
        { name: 'FOLDER' },
        { name: 'PARENT' },
        { name: 'data.tar.gz' },
        { name: 'lorem.txt' },
        { name: 'lorem-big.txt' }
      ]
    })
    // And "Alice" navigates to the trashbin
    await ui.userNavigatesToTrashbin({ world, stepUser: 'Alice' })

    // When "Alice" deletes the following resources from trashbin using the batch action
    //   | resource  |
    //   | lorem.txt |
    //   | PARENT    |
    await ui.userDeletesResourcesFromTrashbinUsingBatchAction({
      world,
      stepUser: 'Alice',
      resources: ['lorem.txt', 'PARENT']
    })

    // And "Alice" empties the trashbin
    await ui.userEmptiesTrashbin({ world, stepUser: 'Alice' })

    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })

  test('delete and restore a file inside a received shared folder', async ({ world }) => {
    // Given "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    // Given "Alice" creates the following folders in personal space using API
    //   | name          |
    //   | folderToShare |
    //   | empty-folder   |
    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: ['folderToShare', 'empty-folder']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile              | content     |
    //   | folderToShare/lorem.txt | lorem ipsum |
    //   | sample.txt              | sample      |
    await api.userHasCreatedFiles({
      world,
      stepUser: 'Alice',
      files: [
        { pathToFile: 'folderToShare/lorem.txt', content: 'lorem ipsum' },
        { pathToFile: 'sample.txt', content: 'sample' }
      ]
    })
    // And "Alice" shares the following resource using API
    //   | resource      | recipient | type | role                   | resourceType |
    //   | folderToShare | Brian     | user | Can edit with trashbin | folder       |
    await api.userHasSharedResources({
      world,
      stepUser: 'Alice',
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
    // And "Brian" navigates to the shared with me page
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    // And "Brian" opens folder "folderToShare"
    await ui.userOpensResource({ world, stepUser: 'Brian', resource: 'folderToShare' })
    // When "Brian" deletes the following resources using the sidebar panel
    //   | resource  |
    //   | lorem.txt |
    await ui.userDeletesResources({
      world,
      stepUser: 'Brian',
      actionType: fileAction.sideBarPanel,
      resources: [{ name: 'lorem.txt' }]
    })
    // And "Brian" navigates to the trashbin
    await ui.userNavigatesToTrashbin({ world, stepUser: 'Brian' })
    // Then following resources should not be displayed in the trashbin for user "Brian"
    //   | resource                |
    //   | folderToShare/lorem.txt |
    await ui.userShouldNotSeeTheResources({
      world,
      listType: resourcePage.trashbin,
      stepUser: 'Brian',
      resources: ['folderToShare/lorem.txt']
    })

    // When "Alice" deletes the following resources using the sidebar panel
    //   | resource     |
    //   | sample.txt   |
    //   | empty-folder |
    await ui.userDeletesResources({
      world,
      stepUser: 'Alice',
      actionType: fileAction.sideBarPanel,
      resources: [{ name: 'sample.txt' }, { name: 'empty-folder' }]
    })
    // And "Alice" navigates to the trashbin
    await ui.userNavigatesToTrashbin({ world, stepUser: 'Alice' })
    // Then following resources should be displayed in the trashbin for user "Alice"
    //   | resource                |
    //   | folderToShare/lorem.txt |
    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.trashbin,
      stepUser: 'Alice',
      resources: ['folderToShare/lorem.txt']
    })
    // And "Alice" restores the following resources from trashbin
    //   | resource                |
    //   | folderToShare/lorem.txt |
    await ui.userRestoresResourcesFromTrashbin({
      world,
      stepUser: 'Alice',
      resources: ['folderToShare/lorem.txt']
    })
    // And "Alice" restores the following resources from trashbin using the batch action
    //   | resource                |
    //   | sample.txt              |
    //   | empty-folder            |
    await ui.userRestoresResourcesFromTrashbin({
      world,
      stepUser: 'Alice',
      resources: ['sample.txt', 'empty-folder']
    })
    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })
    // And "Alice" opens folder "folderToShare"
    await ui.userOpensResource({ world, stepUser: 'Alice', resource: 'folderToShare' })
    // And following resources should be displayed in the files list for user "Alice"
    //   | resource  |
    //   | lorem.txt |
    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.filesList,
      stepUser: 'Alice',
      resources: ['lorem.txt']
    })
    // And "Brian" navigates to the shared with me page
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    // And "Brian" opens folder "folderToShare"
    await ui.userOpensResource({ world, stepUser: 'Brian', resource: 'folderToShare' })
    // And following resources should be displayed in the files list for user "Brian"
    //   | resource  |
    //   | lorem.txt |
    await ui.userShouldSeeResources({
      world,
      listType: resourcePage.filesList,
      stepUser: 'Brian',
      resources: ['lorem.txt']
    })
    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
