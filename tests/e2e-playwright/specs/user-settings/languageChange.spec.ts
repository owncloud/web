import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  LinksEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment/index.js'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe('language settings', { tag: '@predefined-users' }, () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const linksEnvironment = new LinksEnvironment()
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
    await api.usersHaveBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    // Given "Alice" logs in
    await ui.userLogsIn({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test('system language change', async () => {
    // And "Alice" creates the following folder in personal space using API
    //   | name          |
    //   | check_message |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Alice',
      folderName: 'check_message'
    })
    // And "Alice" shares the following resource using API
    //   | resource      | recipient | type | role     | resourceType |
    //   | check_message | Brian     | user | Can edit | folder       |
    await api.userHasSharedResources({
      usersEnvironment,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'check_message',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit',
          resourceType: 'folder'
        }
      ]
    })
    // And "Alice" logs out
    await ui.userLogsOut({ actorsEnvironment, stepUser: 'Alice' })
    // And "Brian" logs in
    await ui.userLogsIn({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // When "Brian" opens the user menu
    await ui.userOpensAccountPage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" changes the language to "Deutsch - German"
    await ui.userChangesLanguage({
      actorsEnvironment,
      stepUser: 'Brian',
      language: 'Deutsch - German'
    })
    // Then "Brian" should see the following account page title "Mein Konto"
    await ui.userShouldSeeAccountPageTitle({
      actorsEnvironment,
      stepUser: 'Brian',
      expectedTitle: 'Mein Konto'
    })
    // And "Brian" should see the following notifications
    // | Alice hat check_message mit Ihnen geteilt |
    await ui.userShouldSeeNotifications({
      actorsEnvironment,
      stepUser: 'Brian',
      expectedMessages: ['Alice Hansen hat check_message mit Ihnen geteilt']
    })
    // And "Brian" logs out
    await ui.userLogsOut({ actorsEnvironment, stepUser: 'Brian' })
  })

  test('anonymous user language change', async () => {
    // And "Alice" creates the following folder in personal space using API
    //   | name         |
    //   | folderPublic |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Alice',
      folderName: 'folderPublic'
    })
    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                | to        |
    //   | filesForUpload/lorem.txt | lorem.txt |
    await api.userHasUploadedFilesInPersonalSpace({
      usersEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      filesToUpload: [{ localFile: 'filesForUpload/lorem.txt', to: 'lorem.txt' }]
    })
    // And "Alice" creates a public link of following resource using API
    //   | resource     | password |
    //   | folderPublic | %public% |
    await api.userHasCreatedPublicLinkOfResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      password: '%public%'
    })
    // And "Alice" logs out
    await ui.userLogsOut({ actorsEnvironment, stepUser: 'Alice' })
    // When "Anonymous" opens the public link "Unnamed link"
    await ui.anonymousUserOpensPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'Unnamed link'
    })
    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Anonymous'
    })
    // And "Anonymous" opens the user menu
    await ui.userOpensAccountPage({ actorsEnvironment, stepUser: 'Anonymous' })
    // And "Anonymous" changes the language to "Deutsch - German"
    await ui.userChangesLanguage({
      actorsEnvironment,
      stepUser: 'Anonymous',
      language: 'Deutsch - German'
    })
    // Then "Anonymous" should see the following account page title "Mein Konto"
    await ui.userShouldSeeAccountPageTitle({
      actorsEnvironment,
      stepUser: 'Anonymous',
      expectedTitle: 'Mein Konto'
    })
  })
})
