import { test } from '../../support/test'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe(
  'Users can create shortcuts for resources and sites',
  { tag: '@predefined-users' },
  () => {
    test.beforeEach(async ({ world }) => {
      //   Given "Admin" creates following users using API
      //    | id    |
      //    | Alice |
      //    | Brian |
      await api.usersHaveBeenCreated({
        world,
        stepUser: 'Admin',
        users: ['Alice', 'Brian']
      })
    })

    test('shortcut', async ({ world }) => {
      // Given "Alice" logs in
      await ui.userLogsIn({ world, stepUser: 'Alice' })
      // And "Brian" logs in
      await ui.userLogsIn({ world, stepUser: 'Brian' })

      // And "Alice" creates the following folders in personal space using API
      //   | name |
      //   | docs |
      await api.userHasCreatedFolder({ world, stepUser: 'Alice', folderName: 'docs' })

      // And "Alice" creates the following files into personal space using API
      // | pathToFile      | content           |
      // | docs/notice.txt | important content |
      await api.userHasCreatedFiles({
        world,
        stepUser: 'Alice',
        files: [{ pathToFile: 'docs/notice.txt', content: 'important content' }]
      })

      // And "Alice" uploads the following local file into personal space using API
      // | localFile                     | to             |
      // | filesForUpload/testavatar.jpg | testavatar.jpg |
      await api.userHasUploadedFilesInPersonalSpace({
        world,
        stepUser: 'Alice',
        filesToUpload: [{ localFile: 'filesForUpload/testavatar.jpg', to: 'testavatar.jpg' }]
      })
      // And "Alice" shares the following resource using API
      // | resource       | recipient | type | role     | resourceType |
      // | testavatar.jpg | Brian     | user | Can view | file         |
      await api.userHasSharedResources({
        world,
        stepUser: 'Alice',
        shares: [
          {
            resource: 'testavatar.jpg',
            recipient: 'Brian',
            type: 'user',
            role: 'Can view',
            resourceType: 'file'
          }
        ]
      })
      // And "Alice" creates a public link of following resource using API
      // | resource        | password |
      // | docs/notice.txt | %public% |
      await api.userHasCreatedPublicLinkOfResource({
        world,
        stepUser: 'Alice',
        resource: 'docs/notice.txt',
        password: '%public%'
      })
      // And "Alice" renames the most recently created public link of resource "docs/notice.txt" to "myPublicLink"
      await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
        world,
        stepUser: 'Alice',
        resource: 'docs/notice.txt',
        newName: 'myPublicLink'
      })
      // When "Alice" opens the "files" app
      await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })

      // # create a shortcut to file folder website
      // And "Alice" creates a shortcut for the following resources
      // | resource                   | name           | type    |
      // | notice.txt                 | important file | file    |
      // | docs                       |                | folder  |
      // | https://owncloud.com/news/ | companyNews    | website |
      await ui.userCreatesShortcutForResources({
        world,
        stepUser: 'Alice',
        resources: [
          { resource: 'notice.txt', name: 'important file', type: 'file' },
          { resource: 'docs', name: '', type: 'folder' },
          { resource: 'https://owncloud.com/news/', name: 'companyNews', type: 'website' }
        ]
      })

      // And "Alice" downloads the following resources using the sidebar panel
      // | resource           | type |
      // | important file.url | file |
      const resourceToDownload = [{ resource: 'important file.url', type: 'file' }]
      await ui.userDownloadsResource({
        world,
        stepUser: 'Alice',
        resourceToDownload: resourceToDownload,
        actionType: 'SIDEBAR_PANEL'
      })

      // When "Alice" opens a shortcut "important file.url"
      await ui.userOpensShortcut({
        world,
        stepUser: 'Alice',
        name: 'important file.url'
      })
      // Then "Alice" is in a text-editor
      await ui.userIsInFileViewer({
        world,
        stepUser: 'Alice',
        fileViewerType: 'text-editor'
      })
      // And "Alice" closes the file viewer
      await ui.userClosesFileViewer({ world, stepUser: 'Alice' })
      // And "Alice" opens the "files" app
      await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })
      // Then "Alice" can open a shortcut "companyNews.url" with external url "https://owncloud.com/news/"
      await ui.userCanOpenShortcutWithExternalUrl({
        world,
        stepUser: 'Alice',
        name: 'companyNews.url',
        url: 'https://owncloud.com/news/'
      })
      // And "Alice" logs out
      await ui.userLogsOut({ world, stepUser: 'Alice' })

      // # create a shortcut to the shared file
      // When "Brian" creates a shortcut for the following resources
      // | resource       | name | type |
      // | testavatar.jpg | logo | file |
      await ui.userCreatesShortcutForResources({
        world,
        stepUser: 'Brian',
        resources: [{ resource: 'testavatar.jpg', name: 'logo', type: 'file' }]
      })
      // And "Brian" opens a shortcut "logo.url"
      await ui.userOpensShortcut({
        world,
        stepUser: 'Brian',
        name: 'logo.url'
      })
      // Then "Brian" is in a media-viewer
      await ui.userIsInFileViewer({
        world,
        stepUser: 'Brian',
        fileViewerType: 'media-viewer'
      })
      // And "Brian" closes the file viewer
      await ui.userClosesFileViewer({ world, stepUser: 'Brian' })

      // # create a shortcut to the public link
      // When "Brian" opens the "files" app
      await ui.userOpensApplication({ world, stepUser: 'Brian', name: 'files' })
      // And "Brian" creates a shortcut for the following resources
      // | resource     | name             | type        |
      // | myPublicLink | linkToNoticeFile | public link |
      await ui.userCreatesShortcutForResources({
        world,
        stepUser: 'Brian',
        resources: [{ resource: 'myPublicLink', name: 'linkToNoticeFile', type: 'public link' }]
      })
      // And "Brian" opens a shortcut "linkToNoticeFile.url"
      await ui.userOpensShortcut({
        world,
        stepUser: 'Brian',
        name: 'linkToNoticeFile.url'
      })
      // And "Brian" unlocks the public link with password "%public%"
      await ui.userUnlocksPublicLink({
        world,
        password: '%public%',
        stepUser: 'Brian'
      })
      // Then "Brian" is in a text-editor
      await ui.userIsInFileViewer({
        world,
        stepUser: 'Brian',
        fileViewerType: 'text-editor'
      })
      // And "Brian" logs out
      await ui.userLogsOut({ world, stepUser: 'Brian' })
    })
  }
)
