import { expect, test } from '@playwright/test'
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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })

    // Given "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
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
    await api.userHasSharedResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'check_message',
      recipient: 'Brian',
      type: 'user',
      role: 'Can edit',
      resourceType: 'folder'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // When "Brian" opens the user menu
    await ui.openAccountPage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" changes the language to "Deutsch - German"
    await ui.changeLanguage({ actorsEnvironment, stepUser: 'Brian', language: 'Deutsch - German' })
    // Then "Brian" should see the following account page title "Mein Konto"
    const actualTitle = await ui.getAccountPageTitle({ actorsEnvironment, stepUser: 'Brian' })
    expect(actualTitle).toEqual('Mein Konto')
    // And "Brian" should see the following notifications
    // | Alice hat check_message mit Ihnen geteilt |
    const messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Brian' })
    expect(messages).toContain('Alice Hansen hat check_message mit Ihnen geteilt')
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
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
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    // When "Anonymous" opens the public link "Unnamed link"
    await ui.anonymousUserOpensPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'Unnamed link'
    })
    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.anonymousUserUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Anonymous'
    })
    // And "Anonymous" opens the user menu
    await ui.openAccountPage({ actorsEnvironment, stepUser: 'Anonymous' })
    // And "Anonymous" changes the language to "Deutsch - German"
    await ui.changeLanguage({
      actorsEnvironment,
      stepUser: 'Anonymous',
      language: 'Deutsch - German'
    })
    // Then "Anonymous" should see the following account page title "Mein Konto"
    const actualTitle = await ui.getAccountPageTitle({ actorsEnvironment, stepUser: 'Anonymous' })
    expect(actualTitle).toEqual('Mein Konto')
  })
})
