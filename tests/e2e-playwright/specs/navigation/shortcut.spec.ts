import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  FilesEnvironment,
  UsersEnvironment
} from '../../../e2e/support/environment/index.js'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe(
  'Users can create shortcuts for resources and sites',
  { tag: '@predefined-users' },
  () => {
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
      //   Given "Admin" creates following users using API
      //    | id    |
      //    | Alice |
      //    | Brian |
      await api.userHasBeenCreated({
        usersEnvironment,
        stepUser: 'Admin',
        userToBeCreated: 'Alice'
      })
      await api.userHasBeenCreated({
        usersEnvironment,
        stepUser: 'Admin',
        userToBeCreated: 'Brian'
      })
    })

    test.afterEach(async () => {
      await api.deleteUser({
        usersEnvironment,
        stepUser: 'Admin',
        targetUser: 'Alice'
      })
      await api.deleteUser({
        usersEnvironment,
        stepUser: 'Admin',
        targetUser: 'Brian'
      })
    })

    test('shortcut', async () => {
      // Given "Alice" logs in
      await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
      // And "Brian" logs in
      await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

      // And "Alice" creates the following folders in personal space using API
      //   | name |
      //   | docs |
      await api.userHasCreatedFolder({ usersEnvironment, stepUser: 'Alice', folderName: 'docs' })

      // And "Alice" creates the following files into personal space using API
      // | pathToFile      | content           |
      // | docs/notice.txt | important content |
      await api.userHasCreatedFile({
        usersEnvironment,
        stepUser: 'Alice',
        filename: 'docs/notice.txt',
        content: 'important content'
      })

      // And "Alice" uploads the following local file into personal space using API
      // | localFile                     | to             |
      // | filesForUpload/testavatar.jpg | testavatar.jpg |
      await api.userHasUploadedFilesInPersonalSpace({
        usersEnvironment,
        filesEnvironment,
        stepUser: 'Alice',
        filesToUpload: [{ localFile: 'filesForUpload/testavatar.jpg', to: 'testavatar.jpg' }]
      })
      // And "Alice" shares the following resource using API
      // | resource       | recipient | type | role     | resourceType |
      // | testavatar.jpg | Brian     | user | Can view | file         |
      await api.userHasSharedResource({
        usersEnvironment,
        stepUser: 'Alice',
        resource: 'testavatar.jpg',
        recipient: 'Brian',
        type: 'user',
        role: 'Can view',
        resourceType: 'file'
      })
      // And "Alice" creates a public link of following resource using API
      // | resource        | password |
      // | docs/notice.txt | %public% |
      await api.userHasCreatedPublicLinkOfResource({
        usersEnvironment,
        stepUser: 'Alice',
        resource: 'docs/notice.txt',
        password: '%public%'
      })
      // And "Alice" renames the most recently created public link of resource "docs/notice.txt" to "myPublicLink"
      await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
        actorsEnvironment,
        stepUser: 'Alice',
        resource: 'docs/notice.txt',
        newName: 'myPublicLink'
      })
      // When "Alice" opens the "files" app
      await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })

      // # create a shortcut to file folder website
      // And "Alice" creates a shortcut for the following resources
      // | resource                   | name           | type    |
      // | notice.txt                 | important file | file    |
      // | docs                       |                | folder  |
      // | https://owncloud.com/news/ | companyNews    | website |
      await ui.userCreatesShortcutForResource({
        actorsEnvironment,
        stepUser: 'Alice',
        resource: 'notice.txt',
        name: 'important file',
        type: 'file'
      })
      await ui.userCreatesShortcutForResource({
        actorsEnvironment,
        stepUser: 'Alice',
        resource: 'docs',
        name: '',
        type: 'folder'
      })
      await ui.userCreatesShortcutForResource({
        actorsEnvironment,
        stepUser: 'Alice',
        resource: 'https://owncloud.com/news/',
        name: 'companyNews',
        type: 'website'
      })

      // And "Alice" downloads the following resources using the sidebar panel
      // | resource           | type |
      // | important file.url | file |
      const resourceToDownload = [{ resource: 'important file.url', type: 'file' }]
      await ui.userDownloadsResource({
        actorsEnvironment,
        stepUser: 'Alice',
        resourceToDownload: resourceToDownload,
        actionType: 'SIDEBAR_PANEL'
      })

      // When "Alice" opens a shortcut "important file.url"
      await ui.userOpensShortcut({
        actorsEnvironment,
        stepUser: 'Alice',
        name: 'important file.url'
      })
      // Then "Alice" is in a text-editor
      await ui.userIsInFileViewer({
        actorsEnvironment,
        stepUser: 'Alice',
        fileViewerType: 'text-editor'
      })
      // And "Alice" closes the file viewer
      await ui.userClosesTextEditor({ actorsEnvironment, stepUser: 'Alice' })
      // And "Alice" opens the "files" app
      await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })
      // Then "Alice" can open a shortcut "companyNews.url" with external url "https://owncloud.com/news/"
      await ui.userCanOpenShortcutWithExternalUrl({
        actorsEnvironment,
        stepUser: 'Alice',
        name: 'companyNews.url',
        url: 'https://owncloud.com/news/'
      })
      // And "Alice" logs out
      await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })

      // # create a shortcut to the shared file
      // When "Brian" creates a shortcut for the following resources
      // | resource       | name | type |
      // | testavatar.jpg | logo | file |
      await ui.userCreatesShortcutForResource({
        actorsEnvironment,
        stepUser: 'Brian',
        resource: 'testavatar.jpg',
        name: 'logo',
        type: 'file'
      })
      // And "Brian" opens a shortcut "logo.url"
      await ui.userOpensShortcut({
        actorsEnvironment,
        stepUser: 'Brian',
        name: 'logo.url'
      })
      // Then "Brian" is in a media-viewer
      await ui.userIsInFileViewer({
        actorsEnvironment,
        stepUser: 'Brian',
        fileViewerType: 'media-viewer'
      })
      // And "Brian" closes the file viewer
      await ui.userClosesTextEditor({ actorsEnvironment, stepUser: 'Brian' })

      // # create a shortcut to the public link
      // When "Brian" opens the "files" app
      await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Brian', name: 'files' })
      // And "Brian" creates a shortcut for the following resources
      // | resource     | name             | type        |
      // | myPublicLink | linkToNoticeFile | public link |
      await ui.userCreatesShortcutForResource({
        actorsEnvironment,
        stepUser: 'Brian',
        resource: 'myPublicLink',
        name: 'linkToNoticeFile',
        type: 'public link'
      })
      // And "Brian" opens a shortcut "linkToNoticeFile.url"
      await ui.userOpensShortcut({
        actorsEnvironment,
        stepUser: 'Brian',
        name: 'linkToNoticeFile.url'
      })
      // And "Brian" unlocks the public link with password "%public%"
      await ui.userUnlocksPublicLink({
        actorsEnvironment,
        password: '%public%',
        stepUser: 'Brian'
      })
      // Then "Brian" is in a text-editor
      await ui.userIsInFileViewer({
        actorsEnvironment,
        stepUser: 'Brian',
        fileViewerType: 'text-editor'
      })
      // And "Brian" logs out
      await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    })
  }
)
