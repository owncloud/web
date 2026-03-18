import { test } from '../../support/test'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe('language settings', { tag: '@predefined-users' }, () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following users using API
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    // Given "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })
  })

  test('system language change', async ({ world }) => {
    // And "Alice" creates the following folder in personal space using API
    //   | name          |
    //   | check_message |
    await api.userHasCreatedFolder({
      world,
      stepUser: 'Alice',
      folderName: 'check_message'
    })
    // And "Alice" shares the following resource using API
    //   | resource      | recipient | type | role     | resourceType |
    //   | check_message | Brian     | user | Can edit | folder       |
    await api.userHasSharedResources({
      world,
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
    await ui.userLogsOut({ world, stepUser: 'Alice' })
    // And "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    // When "Brian" opens the user menu
    await ui.userOpensAccountPage({ world, stepUser: 'Brian' })
    // And "Brian" changes the language to "Deutsch - German"
    await ui.userChangesLanguage({
      world,
      stepUser: 'Brian',
      language: 'Deutsch - German'
    })
    // Then "Brian" should see the following account page title "Mein Konto"
    await ui.userShouldSeeAccountPageTitle({
      world,
      stepUser: 'Brian',
      expectedTitle: 'Mein Konto'
    })
    // And "Brian" should see the following notifications
    // | Alice hat check_message mit Ihnen geteilt |
    await ui.userShouldSeeNotifications({
      world,
      stepUser: 'Brian',
      expectedMessages: ['Alice Hansen hat check_message mit Ihnen geteilt']
    })
    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })
  })

  test('anonymous user language change', async ({ world }) => {
    // And "Alice" creates the following folder in personal space using API
    //   | name         |
    //   | folderPublic |
    await api.userHasCreatedFolder({
      world,
      stepUser: 'Alice',
      folderName: 'folderPublic'
    })
    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                | to        |
    //   | filesForUpload/lorem.txt | lorem.txt |
    await api.userHasUploadedFilesInPersonalSpace({
      world,
      stepUser: 'Alice',
      filesToUpload: [{ localFile: 'filesForUpload/lorem.txt', to: 'lorem.txt' }]
    })
    // And "Alice" creates a public link of following resource using API
    //   | resource     | password |
    //   | folderPublic | %public% |
    await api.userHasCreatedPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      password: '%public%'
    })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
    // When "Anonymous" opens the public link "Unnamed link"
    await ui.anonymousUserOpensPublicLink({
      world,
      stepUser: 'Anonymous',
      name: 'Unnamed link'
    })
    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      world,
      password: '%public%',
      stepUser: 'Anonymous'
    })
    // And "Anonymous" opens the user menu
    await ui.userOpensAccountPage({ world, stepUser: 'Anonymous' })
    // And "Anonymous" changes the language to "Deutsch - German"
    await ui.userChangesLanguage({
      world,
      stepUser: 'Anonymous',
      language: 'Deutsch - German'
    })
    // Then "Anonymous" should see the following account page title "Mein Konto"
    await ui.userShouldSeeAccountPageTitle({
      world,
      stepUser: 'Anonymous',
      expectedTitle: 'Mein Konto'
    })
  })
})
