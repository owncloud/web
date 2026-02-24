import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment,
  SpacesEnvironment,
  LinksEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('Users can see all activities of the resources and spaces', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const filesEnvironment = new FilesEnvironment()
  const spacesEnvironment = new SpacesEnvironment()
  const linksEnvironment = new LinksEnvironment()

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
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('Upload files in personal space', { tag: '@predefined-users' }, async () => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })
    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })
    // Given "Alice" creates the following project space using API
    //   | name | id     |
    //   | team | team.1 |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'team',
      id: 'team.1'
    })
    // And "Alice" adds the following members to the space "team" using API
    //   | user  | role     | shareType |
    //   | Brian | Can view | user      |
    await api.userHasAddedMembersToSpace({
      usersEnvironment,
      stepUser: 'Alice',
      space: 'team',
      sharee: 'Brian',
      role: 'Can view',
      shareType: 'user'
    })

    // And "Alice" creates a public link of the space using API
    //   | space | name       | password |
    //   | team  | space link | %public% |
    await api.userHasCreatedPublicLinkOfSpace({
      usersEnvironment,
      stepUser: 'Alice',
      space: 'team',
      name: 'space link',
      password: '%public%'
    })
    // And "Alice" creates the following folder in personal space using API
    //   | name                   |
    //   | sharedFolder/subFolder |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['sharedFolder/subFolder']
    })
    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                   | to                        |
    //   | filesForUpload/textfile.txt | sharedFolder/textfile.txt |
    await api.userHasUploadedFilesInPersonalSpace({
      usersEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      filesToUpload: [{ localFile: 'filesForUpload/textfile.txt', to: 'sharedFolder/textfile.txt' }]
    })
    // And "Alice" shares the following resource using API
    //   | resource     | recipient | type | role                   | resourceType |
    //   | sharedFolder | Brian     | user | Can edit with trashbin | folder       |
    await api.userHasSharedResources({
      usersEnvironment,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'sharedFolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit with trashbin',
          resourceType: 'folder'
        }
      ]
    })
    // And "Alice" creates a public link of following resource using API
    //   | resource     | role                   | password |
    //   | sharedFolder | Can edit with trashbin | %public% |
    await api.userHasCreatedPublicLinkOfResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'sharedFolder',
      role: 'Can edit with trashbin',
      password: '%public%'
    })

    // When "Anonymous" opens the public link "Unnamed link"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'Unnamed link'
    })

    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      stepUser: 'Anonymous',
      password: '%public%'
    })
    // And "Anonymous" edits the following resources
    //   | resource     | content     |
    //   | textfile.txt | new content |
    await ui.userEditsFile({
      actorsEnvironment,
      stepUser: 'Anonymous',
      resources: [{ name: 'textfile.txt', content: 'new content' }]
    })
    // Then "Anonymous" should not see any activity of the following resource
    //   | resource     |
    //   | textfile.txt |
    await ui.userShouldNotSeeAnyActivityOfResources({
      actorsEnvironment,
      stepUser: 'Anonymous',
      resources: ['textfile.txt']
    })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" renames the following resource
    //   | resource                  | as      |
    //   | sharedFolder/textfile.txt | new.txt |
    await ui.userRenamesResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'sharedFolder/textfile.txt',
      newResourceName: 'new.txt'
    })
    // And "Alice" deletes the following resource using the sidebar panel
    //   | resource  | from         |
    //   | subFolder | sharedFolder |
    await ui.userDeletesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [{ name: 'subFolder', from: 'sharedFolder' }],
      actionType: 'SIDEBAR_PANEL'
    })

    // Then "Alice" should see activity of the following resource
    //   | resource     | activity                                                                 |
    //   | sharedFolder | %user_alice_displayName% deleted subFolder from sharedFolder             |
    //   | sharedFolder | %user_alice_displayName% renamed textfile.txt to new.txt                 |
    //   | sharedFolder | Public updated textfile.txt in sharedFolder                              |
    //   | sharedFolder | %user_alice_displayName% shared sharedFolder via link                    |
    //   | sharedFolder | %user_alice_displayName% shared sharedFolder with brian                  |
    //   | sharedFolder | %user_alice_displayName% added textfile.txt to sharedFolder              |
    //   | sharedFolder | %user_alice_displayName% added subFolder to sharedFolder                 |
    //   | sharedFolder | %user_alice_displayName% added sharedFolder to %user_alice_displayName%  |

    //   | sharedFolder/new.txt | %user_alice_displayName% renamed textfile.txt to new.txt         |
    //   | new.txt              | Public updated textfile.txt in sharedFolder                      |
    //   | new.txt              | %user_alice_displayName% added textfile.txt to sharedFolder      |
    await ui.userShouldSeeActivityOfResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [
        {
          resource: 'sharedFolder',
          activity: '%user_alice_displayName% deleted subFolder from sharedFolder'
        },
        {
          resource: 'sharedFolder',
          activity: '%user_alice_displayName% renamed textfile.txt to new.txt'
        },
        { resource: 'sharedFolder', activity: 'Public updated textfile.txt in sharedFolder' },
        {
          resource: 'sharedFolder',
          activity: '%user_alice_displayName% shared sharedFolder via link'
        },
        {
          resource: 'sharedFolder',
          activity: '%user_alice_displayName% shared sharedFolder with brian'
        },
        {
          resource: 'sharedFolder',
          activity: '%user_alice_displayName% added textfile.txt to sharedFolder'
        },
        {
          resource: 'sharedFolder',
          activity: '%user_alice_displayName% added subFolder to sharedFolder'
        },
        {
          resource: 'sharedFolder',
          activity: '%user_alice_displayName% added sharedFolder to %user_alice_displayName%'
        },
        {
          resource: 'sharedFolder/new.txt',
          activity: '%user_alice_displayName% renamed textfile.txt to new.txt'
        },
        { resource: 'new.txt', activity: 'Public updated textfile.txt in sharedFolder' },
        {
          resource: 'new.txt',
          activity: '%user_alice_displayName% added textfile.txt to sharedFolder'
        }
      ]
    })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })

    // see activity in the project space
    // When "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" navigates to the project space "team.1"
    await ui.navigateToSpace({
      actorsEnvironment,
      stepUser: 'Brian',
      space: 'team.1'
    })
    // Then "Brian" should see activity of the space
    //   | activity                                               |
    //   | %user_alice_displayName% shared team via link          |
    //   | %user_alice_displayName% added brian as member of team |
    //   | %user_alice_displayName% added readme.md to .space     |
    await ui.userShouldSeeActivitiesOfSpace({
      actorsEnvironment,
      stepUser: 'Brian',
      activities: [
        '%user_alice_displayName% shared team via link',
        '%user_alice_displayName% added brian as member of team',
        '%user_alice_displayName% added readme.md to .space'
      ]
    })

    // see activity in the shared resources
    // When "Brian" navigates to the shared with me page
    await ui.navigateToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })

    // Then "Brian" should not see any activity of the following resource
    //   | resource             |
    //   | sharedFolder/new.txt |
    await ui.userShouldNotSeeAnyActivityOfResources({
      actorsEnvironment,
      stepUser: 'Brian',
      resources: ['sharedFolder/new.txt']
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })
})
