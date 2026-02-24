import { test } from '@playwright/test'
import { config } from '../../../e2e/config'
import {
  ActorsEnvironment,
  FilesEnvironment,
  UsersEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { applications } from '../../support/constants.js'

test.describe('Download', { tag: '@predefined-users' }, () => {
  let actorsEnvironment: ActorsEnvironment
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
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('download resources', async () => {
    // Given "Alice" logs in
    // Given "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Alice" creates the following folders in personal space using API
    //   | name         |
    //   | folderPublic |
    //   | emptyFolder  |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['folderPublic', 'emptyFolder']
    })

    // And "Alice" creates the following files into personal space using API
    //   | pathToFile                | content     |
    //   | folderPublic/new file.txt | lorem ipsum |
    await api.userHasCreatedFiles({
      usersEnvironment,
      stepUser: 'Alice',
      files: [{ pathToFile: 'folderPublic/new file.txt', content: 'lorem ipsum' }]
    })

    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                     | to             |
    //   | filesForUpload/testavatar.jpg | testavatar.jpg |
    await api.userHasUploadedFilesInPersonalSpace({
      usersEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      filesToUpload: [{ localFile: 'filesForUpload/testavatar.jpg', to: 'testavatar.jpg' }]
    })

    // And "Alice" shares the following resource using API
    //   | resource       | recipient | type | role                                | resourceType |
    //   | folderPublic   | Brian     | user | Can edit with versions and trashbin | folder       |
    //   | emptyFolder    | Brian     | user | Can edit with versions and trashbin | folder       |
    //   | testavatar.jpg | Brian     | user | Can edit with versions and trashbin | file         |
    await api.userHasSharedResources({
      usersEnvironment,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'folderPublic',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with versions and trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'emptyFolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with versions and trashbin',
          resourceType: 'folder'
        },
        {
          resource: 'testavatar.jpg',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with versions and trashbin',
          resourceType: 'file'
        }
      ]
    })

    // When "Alice" downloads the following resources using the batch action
    //   | resource       | type   |
    //   | folderPublic   | folder |
    //   | emptyFolder    | folder |
    //   | testavatar.jpg | file   |
    const resourceToDownloadInBatch = [
      { resource: 'folderPublic', type: 'folder' },
      { resource: 'emptyFolder', type: 'folder' },
      { resource: 'testavatar.jpg', type: 'file' }
    ]
    await ui.userDownloadsResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resourceToDownload: resourceToDownloadInBatch,
      actionType: 'BATCH_ACTION'
    })

    // And "Alice" opens the following file in mediaviewer
    //   | resource       |
    //   | testavatar.jpg |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testavatar.jpg',
      application: applications.mediaViewer
    })

    // And "Alice" downloads the following resources using the preview topbar
    //   | resource       | type |
    //   | testavatar.jpg | file |
    const downloadImage = [{ resource: 'testavatar.jpg', type: 'file' }]
    await ui.userDownloadsResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resourceToDownload: downloadImage,
      actionType: 'PREVIEW_TOPBAR'
    })

    // And "Alice" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })

    // When "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" downloads the following resources using the batch action
    //   | resource       | type   |
    //   | folderPublic   | folder |
    //   | emptyFolder    | folder |
    //   | testavatar.jpg | file   |
    await ui.userDownloadsResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resourceToDownload: resourceToDownloadInBatch,
      actionType: 'BATCH_ACTION'
    })

    // And "Brian" downloads the following resources using the sidebar panel
    //   | resource       | from         | type   |
    //   | new file.txt   | folderPublic | file   |
    //   | testavatar.jpg |              | file   |
    //   | folderPublic   |              | folder |
    //   | emptyFolder    |              | folder |
    const resourceToDownloadSidebar = [
      { resource: 'new file.txt', from: 'folderPublic', type: 'file' },
      { resource: 'testavatar.jpg', type: 'file' },
      { resource: 'folderPublic', type: 'folder' },
      { resource: 'emptyFolder', type: 'folder' }
    ]
    await ui.userDownloadsResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resourceToDownload: resourceToDownloadSidebar,
      actionType: 'SIDEBAR_PANEL'
    })

    // And "Brian" opens the following file in mediaviewer
    //   | resource       |
    //   | testavatar.jpg |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'testavatar.jpg',
      application: applications.mediaViewer
    })

    // And "Brian" downloads the following resources using the preview topbar
    //   | resource       | type |
    //   | testavatar.jpg | file |
    await ui.userDownloadsResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resourceToDownload: downloadImage,
      actionType: 'PREVIEW_TOPBAR'
    })

    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })
})
