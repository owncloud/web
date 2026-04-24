import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('internal link share', () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice'] })

    // And "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })

    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })
  })

  test('Upload files in personal space', { tag: '@predefined-users' }, async ({ world }) => {
    // Given "Alice" creates the following resources
    //   | resource          | type    | content             |
    //   | new-lorem-big.txt | txtFile | new lorem big file  |
    //   | lorem.txt         | txtFile | lorem file          |
    //   | textfile.txt      | txtFile | some random content |
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'new-lorem-big.txt', type: 'txtFile', content: 'new lorem big file' }]
    })
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'lorem.txt', type: 'txtFile', content: 'lorem file' }]
    })
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'textfile.txt', type: 'txtFile', content: 'some random content' }]
    })
    //   # Coverage for bug: https://github.com/owncloud/ocis/issues/8361
    //   | comma,.txt        | txtFile | comma               |
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'comma,.txt', type: 'txtFile', content: 'comma' }]
    })
    //   # Coverage for bug: https://github.com/owncloud/web/issues/10810
    //   | test#file.txt     | txtFile | some content        |
    //   | test#folder       | folder  |                     |
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'test#file.txt', type: 'txtFile', content: 'some content' }]
    })
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'test#folder', type: 'folder' }]
    })
    // When "Alice" uploads the following resources
    //   | resource          | option    |
    //   | new-lorem-big.txt | replace   |
    //   | lorem.txt         | skip      |
    //   | textfile.txt      | keep both |
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'new-lorem-big.txt', option: 'replace' }]
    })
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'lorem.txt', option: 'skip' }]
    })
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'textfile.txt', option: 'keep both' }]
    })
    // And "Alice" creates the following resources
    //   | resource           | type    | content      |
    //   | PARENT/parent.txt  | txtFile | some text    |
    //   | PARENT/example.txt | txtFile | example text |
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'PARENT/parent.txt', type: 'txtFile', content: 'some text' }]
    })
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'PARENT/example.txt', type: 'txtFile', content: 'example text' }]
    })
    // And "Alice" uploads the following resources via drag-n-drop
    //   | resource       |
    //   | simple.pdf     |
    //   | testavatar.jpg |
    await ui.userUploadsResourcesViaDragNDrop({
      world,
      stepUser: 'Alice',
      resourceNames: ['simple.pdf', 'testavatar.jpg']
    })
    // And "Alice" downloads the following resources using the sidebar panel
    //   | resource      | type   |
    //   | PARENT        | folder |
    //   # Coverage for bug: https://github.com/owncloud/ocis/issues/8361
    //   | comma,.txt    | file   |
    //   # Coverage for bug: https://github.com/owncloud/web/issues/10810
    //   | test#file.txt | file   |
    //   | test#folder   | folder |
    await ui.userDownloadsResource({
      world,
      stepUser: 'Alice',
      resourceToDownload: [
        { resource: 'PARENT', type: 'folder' },
        { resource: 'comma,.txt', type: 'file' },
        { resource: 'test#file.txt', type: 'file' },
        { resource: 'test#folder', type: 'folder' }
      ],
      actionType: 'SIDEBAR_PANEL'
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
  test('upload multiple small files', { tag: '@predefined-users' }, async ({ world }) => {
    // When "Alice" uploads 50 small files in personal space
    await ui.userUploadsMultipleFilesInPersonalSpace({
      world,
      stepUser: 'Alice',
      numberOfFiles: 50
    })
    // Then "Alice" should see 50 resources in the personal space files view
    await ui.userShouldSeeNumberOfResources({
      world,
      stepUser: 'Alice',
      expectedNumberOfResources: 50
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
  test('upload folder', async ({ world }) => {
    // When "Alice" uploads the following resources
    //   | resource | type   |
    //   | PARENT   | folder |
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'PARENT', type: 'folder' }]
    })
    // check that folder content exist
    // And "Alice" opens folder "PARENT"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: 'PARENT'
    })
    // And "Alice" opens the following file in pdfviewer
    //   | resource   |
    //   | simple.pdf |
    await ui.userOpensResourceInViewer({
      world,
      stepUser: 'Alice',
      resource: 'simple.pdf',
      application: 'pdfviewer'
    })
    // Then "Alice" closes the file viewer
    await ui.userClosesFileViewer({ world, stepUser: 'Alice' })
    // upload a folder via drag-n-drop
    // When "Alice" uploads the following resources via drag-n-drop
    //   | resource          |
    //   | Folder,With,Comma |
    await ui.userUploadsResourcesViaDragNDrop({
      world,
      stepUser: 'Alice',
      resourceNames: ['Folder,With,Comma']
    })
    // And "Alice" opens folder "Folder,With,Comma"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: 'Folder,With,Comma'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource          |
    //   | sunday,monday.txt |
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['sunday,monday.txt']
    })
    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })
    // upload empty folder
    // When "Alice" uploads the following resources
    //   | resource | type   |
    //   | FOLDER   | folder |
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'FOLDER', type: 'folder' }]
    })
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['FOLDER']
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
  test('Upload large file when insufficient quota', async ({ world }) => {
    // Given "Admin" logs in
    await ui.userLogsIn({ world, stepUser: 'Admin' })
    // And "Admin" opens the "admin-settings" app
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    // And "Admin" navigates to the users management page
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    // And "Admin" changes the quota of the user "Alice" to "0.00001" using the sidebar panel
    await ui.userChangesQuotaOfUserUsingContextMenu({
      world,
      stepUser: 'Admin',
      key: 'Alice',
      value: '0.00001'
    })
    // And "Admin" logs out
    await ui.userLogsOut({ world, stepUser: 'Admin' })
    // And "Alice" uploads the following resource
    //   | resource        |
    //   | simple.pdf      |
    await ui.userUploadsResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'simple.pdf', to: '' }]
    })
    // When "Alice" tries to upload the following resource
    //   | resource      | error              |
    //   | lorem-big.txt | Insufficient quota |
    await ui.userTriesToUploadResource({
      world,
      stepUser: 'Alice',
      resource: 'lorem-big.txt',
      error: 'Insufficient quota',
      to: ''
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
