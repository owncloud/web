// To run this feature we need to run the external app-provider service along with wopi, OnlyOffice, Collabora services
// This is a minimal test for the integration of ocis with different online office suites like Collabora and OnlyOffice
// Check that the file can be opened in collabora or onlyoffice using the url. https://github.com/owncloud/web/issues/9897

import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('url stability for mobile and desktop client', { tag: '@predefined-users' }, () => {
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
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile          | content                 |
    //   | OpenDocument.odt    | OpenDocument Content    |
    await api.userHasCreatedFiles({
      usersEnvironment,
      stepUser: 'Alice',
      files: [{ pathToFile: 'OpenDocument.odt', content: 'OpenDocument Content' }]
    })
    // And "Alice" creates the following resources
    //   | resource           | type           | content                |
    //   | MicrosoftWord.docx | Microsoft Word | Microsoft Word Content |
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [
        { name: 'MicrosoftWord.docx', type: 'Microsoft Word', content: 'Microsoft Word Content' }
      ]
    })
    // And for "Alice" file "MicrosoftWord.docx" should not be locked
    await ui.resourceShouldNotBeLocked({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'MicrosoftWord.docx'
    })
    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('open office suite files with Collabora and onlyOffice', async () => {
    // desktop feature
    // When "Alice" opens the file "OpenDocument.odt" of space "personal" in Collabora through the URL for desktop client
    await ui.userOpensResourceViaUrl({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'OpenDocument.odt',
      space: 'personal',
      editorName: 'Collabora',
      client: 'desktop'
    })
    // Then "Alice" should see the content "OpenDocument Content" in editor "Collabora"
    await ui.userShouldSeeContentInEditor({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedContent: 'OpenDocument Content',
      editor: 'Collabora'
    })
    // When "Alice" opens the file "MicrosoftWord.docx" of space "personal" in OnlyOffice through the URL for desktop client
    await ui.userOpensResourceViaUrl({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'MicrosoftWord.docx',
      space: 'personal',
      editorName: 'OnlyOffice',
      client: 'desktop'
    })
    // Then "Alice" should see the content "Microsoft Word Content" in editor "OnlyOffice"
    await ui.userShouldSeeContentInEditor({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedContent: 'Microsoft Word Content',
      editor: 'OnlyOffice'
    })

    // mobile feature
    // When "Alice" opens the file "OpenDocument.odt" of space "personal" in Collabora through the URL for mobile client
    await ui.userOpensResourceViaUrl({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'OpenDocument.odt',
      space: 'personal',
      editorName: 'Collabora',
      client: 'mobile'
    })
    // Then "Alice" should see the content "OpenDocument Content" in editor "Collabora"
    await ui.userShouldSeeContentInEditor({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedContent: 'OpenDocument Content',
      editor: 'Collabora'
    })
    // When "Alice" opens the file "MicrosoftWord.docx" of space "personal" in OnlyOffice through the URL for mobile client
    await ui.userOpensResourceViaUrl({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'MicrosoftWord.docx',
      space: 'personal',
      editorName: 'OnlyOffice',
      client: 'mobile'
    })
    // Then "Alice" should see the content "Microsoft Word Content" in editor "OnlyOffice"
    await ui.userShouldSeeContentInEditor({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedContent: 'Microsoft Word Content',
      editor: 'OnlyOffice'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
