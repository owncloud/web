import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment/index.js'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'
import { editor } from '../../../e2e/support/objects/app-files/utils/index.js'

test.describe('Users can create shortcuts for resources and sites', () => {
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

    // Given "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('shortcut', async () => {
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following folders in personal space using API
    //   | name |
    //   | docs |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['spaceFolder', 'spaceFolder/test']
    })

    // And "Alice" creates the following files into personal space using API
    //   | pathToFile      | content           |
    //   | docs/notice.txt | important content |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'docs/notice.txt',
      content: 'important content'
    })

    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                     | to             |
    //   | filesForUpload/testavatar.jpg | testavatar.jpg |
    await api.uploadFileInPersonalSpace({
      usersEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'filesForUpload/testavatar.jpg',
      destination: 'testavatar.jpg'
    })

    // And "Alice" shares the following resource using API
    //   | resource       | recipient | type | role     | resourceType |
    //   | testavatar.jpg | Brian     | user | Can view | file         |
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
    //   | resource        | password |
    //   | docs/notice.txt | %public% |
    await api.userHasCreatedPublicLinkOfResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'docs/notice.txt',
      password: '%public%'
    })

    // And "Alice" renames the most recently created public link of resource "docs/notice.txt" to "myPublicLink"
    await ui.userRenamesMostRecentlyCreatedPublicLinkResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'docs/notice.txt',
      newName: 'myPublicLink'
    })

    // When "Alice" opens the "files" app
    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })

    // create a shortcut to file folder website
    // And "Alice" creates a shortcut for the following resources
    //   | resource                   | name           | type    |
    //   | notice.txt                 | important file | file    |
    //   | docs                       |                | folder  |
    //   | https://owncloud.com/news/ | companyNews    | website |
    await ui.userCreatesShortcut({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'notice.txt',
      type: 'file',
      name: 'important file'
    })
    await ui.userCreatesShortcut({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'docs',
      type: 'folder'
    })
    await ui.userCreatesShortcut({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'https://owncloud.com/news/',
      type: 'website',
      name: 'companyNews'
    })

    // And "Alice" downloads the following resources using the sidebar panel
    //   | resource           | type |
    //   | important file.url | file |
    await ui.userDownloadsResource({
      actorsEnvironment,
      stepUser: 'Alice',
      type: 'file',
      resource: 'important file.url'
    })

    // When "Alice" opens a shortcut "important file.url"
    await ui.userOpensShortcut({ actorsEnvironment, stepUser: 'Alice', name: 'important file.url' })

    // Then "Alice" is in a text-editor
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      fileViewerType: 'text-editor'
    })

    // And "Alice" closes the file viewer
    await editor.close(actorsEnvironment.getActor({ key: 'Alice' }))

    // And "Alice" opens the "files" app
    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })

    //  Then "Alice" can open a shortcut "companyNews.url" with external url "https://owncloud.com/news/"
    await ui.userOpensShortcutWithExternalUrl({
      actorsEnvironment,
      stepUser: 'Alice',
      url: 'https://owncloud.com/news/',
      name: 'companyNews.url'
    })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })

    // create a shortcut to the shared file
    // When "Brian" creates a shortcut for the following resources
    //   | resource       | name | type |
    //   | testavatar.jpg | logo | file |
    await ui.userCreatesShortcut({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'testavatar.jpg',
      type: 'file',
      name: 'logo'
    })

    // And "Brian" opens a shortcut "logo.url"
    await ui.userOpensShortcut({ actorsEnvironment, stepUser: 'Brian', name: 'logo.url' })

    // Then "Brian" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Brian',
      fileViewerType: 'media-viewer'
    })

    // And "Brian" closes the file viewer
    await editor.close(actorsEnvironment.getActor({ key: 'Brian' }))

    // create a shortcut to the public link
    // When "Brian" opens the "files" app
    await ui.openApplication({ actorsEnvironment, stepUser: 'Brian', name: 'files' })
    // And "Brian" creates a shortcut for the following resources
    //   | resource     | name             | type        |
    //   | myPublicLink | linkToNoticeFile | public link |
    await ui.userCreatesShortcut({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'myPublicLink',
      type: 'public link',
      name: 'linkToNoticeFile'
    })
    // And "Brian" opens a shortcut "linkToNoticeFile.url"
    await ui.userOpensShortcut({
      actorsEnvironment,
      stepUser: 'Brian',
      name: 'linkToNoticeFile.url'
    })
    // And "Brian" unlocks the public link with password "%public%"
    await ui.anonymousUserUnlocksPublicLink({
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
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
