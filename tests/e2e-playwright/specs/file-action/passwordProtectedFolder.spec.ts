import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('password-protected folder operation', () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })
  })

  test(
    'password-protected folder in personal space',
    { tag: '@predefined-users' },
    async ({ world }) => {
      // Given "Alice" has logged in
      await ui.userLogsIn({ world, stepUser: 'Alice' })

      // When "Alice" creates the following resources
      //   | resource | type                      | password |
      //   | folder1  | Password Protected Folder | %public% |
      //   | folder2  | Password Protected Folder | %public% |
      await ui.userCreatesResources({
        world,
        stepUser: 'Alice',
        resources: [
          { name: 'folder1', type: 'Password Protected Folder', password: '%public%' },
          { name: 'folder2', type: 'Password Protected Folder', password: '%public%' }
        ]
      })

      // And "Alice" enables the option to display the hidden file
      await ui.userEnablesShowHiddenFilesOption({ world, stepUser: 'Alice' })

      // Then following resources should be displayed in the files list for user "Alice"
      //   | resource                  |
      //   | .PasswordProtectedFolders |
      //   | folder1.psec              |
      //   | folder2.psec              |
      await ui.userShouldSeeResources({
        world,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['.PasswordProtectedFolders', 'folder1.psec', 'folder2.psec']
      })

      // When "Alice" opens folder ".PasswordProtectedFolders/projects/Personal"
      await ui.userOpensResource({
        world,
        stepUser: 'Alice',
        resource: '.PasswordProtectedFolders/projects/Personal'
      })

      // Then following resources should be displayed in the files list for user "Alice"
      //   | resource |
      //   | folder1  |
      //   | folder2  |
      await ui.userShouldSeeResources({
        world,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['folder1', 'folder2']
      })

      // Opening
      // When "Alice" opens the "files" app
      await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })

      // And "Alice" opens folder "folder1.psec"
      await ui.userOpensResource({
        world,
        stepUser: 'Alice',
        resource: 'folder1.psec'
      })

      // When "Alice" tries to unlock password protected folder with password "wrong-password"
      await ui.userTriesToUnlockPasswordProtectedFolderWithPassword({
        world,
        stepUser: 'Alice',
        password: 'wrong-password'
      })

      // And "Alice" unlocks password protected folder with password "%public%"
      await ui.userUnlocksPasswordProtectedFolderWithPassword({
        world,
        stepUser: 'Alice',
        password: '%public%'
      })

      // And "Alice" copies the link of password protected folder "folder1.psec"
      await ui.userCopiesTheLinkOfPasswordProtectedFolder({
        world,
        stepUser: 'Alice',
        resource: 'folder1.psec'
      })

      // And "Alice" closes the password protected folder modal
      await ui.userClosesThePasswordProtectedFolderModal({
        world,
        stepUser: 'Alice'
      })

      // Opening by public user
      // When "Anonymous" opens the "%clipboard%" url
      await ui.userOpensClipboardUrl({
        world,
        stepUser: 'Anonymous',
        url: '%clipboard%'
      })

      // And "Anonymous" unlocks the public link with password "%public%"
      await ui.userUnlocksPublicLink({
        world,
        password: '%public%',
        stepUser: 'Anonymous'
      })

      // And "Anonymous" closes the current tab
      await ui.userClosesTheCurrentTab({
        world,
        stepUser: 'Anonymous'
      })

      // Deletion
      // When "Alice" deletes the following resources using the sidebar panel
      //   | resource     |
      //   | folder1.psec |
      await ui.userDeletesResources({
        world,
        stepUser: 'Alice',
        actionType: 'SIDEBAR_PANEL',
        resources: [{ name: 'folder1.psec' }]
      })

      // And "Alice" opens folder ".PasswordProtectedFolders/projects/Personal"
      await ui.userOpensResource({
        world,
        stepUser: 'Alice',
        resource: '.PasswordProtectedFolders/projects/Personal'
      })

      // Then following resources should not be displayed in the files list for user "Alice"
      //   | resource |
      //   | folder1  |
      await ui.userShouldNotSeeTheResources({
        world,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['folder1']
      })

      // When "Alice" deletes the following resources using the sidebar panel
      //   | resource |
      //   | folder2  |
      await ui.userDeletesResources({
        world,
        stepUser: 'Alice',
        actionType: 'SIDEBAR_PANEL',
        resources: [{ name: 'folder2' }]
      })

      // Then following resources should not be displayed in the files list for user "Alice"
      //   | resource |
      //   | folder2  |
      await ui.userShouldNotSeeTheResources({
        world,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['folder2']
      })

      // And "Alice" navigates to the personal space page
      await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })

      // And following resources should not be displayed in the files list for user "Alice"
      //   | resource     |
      //   | folder2.psec |
      await ui.userShouldNotSeeTheResources({
        world,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['folder2.psec']
      })

      // When "Alice" navigates to the trashbin
      await ui.userNavigatesToTrashbin({ world, stepUser: 'Alice' })

      // Then following resources should be displayed in the trashbin for user "Alice"
      //   | resource     |
      //   | folder1.psec |
      //   | folder2.psec |
      await ui.userShouldSeeResources({
        world,
        listType: 'files list',
        stepUser: 'Alice',
        resources: ['folder1.psec', 'folder2.psec']
      })

      // And "Alice" logs out
      await ui.userLogsOut({ world, stepUser: 'Alice' })
    }
  )

  test('password-protected folder in project space', async ({ world }) => {
    // Given "Admin" creates following user using API
    //   | id    |
    //   | Brian |
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Brian']
    })

    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })

    // And "Alice" has logged in
    await ui.userLogsIn({ world, stepUser: 'Alice' })

    // And "Alice" enables the option to display the hidden file
    await ui.userEnablesShowHiddenFilesOption({ world, stepUser: 'Alice' })

    // And "Alice" navigates to the projects space page
    await ui.userNavigatesToSpacesPage({ world, stepUser: 'Alice' })

    // And "Alice" creates the following project spaces
    //   | name | id     |
    //   | team | team.1 |
    await ui.userCreatesProjectSpace({
      world,
      stepUser: 'Alice',
      spaces: [{ name: 'team', id: 'team.1' }]
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" adds following users to the project space
    //   | user  | role     | kind |
    //   | Brian | Can edit | user |
    await ui.userAddsMembersToSpace({
      world,
      stepUser: 'Alice',
      members: [{ user: 'Brian', role: 'Can edit with versions and trash bin', kind: 'user' }]
    })

    // When "Alice" creates the following resources
    //   | resource      | type                      | password |
    //   | space-folder1 | Password Protected Folder | %public% |
    //   | space-folder2 | Password Protected Folder | %public% |
    //   | space-folder3 | Password Protected Folder | %public% |
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [
        { name: 'space-folder1', type: 'Password Protected Folder', password: '%public%' },
        { name: 'space-folder2', type: 'Password Protected Folder', password: '%public%' },
        { name: 'space-folder3', type: 'Password Protected Folder', password: '%public%' }
      ]
    })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource           |
    //   | space-folder1.psec |
    //   | space-folder2.psec |
    //   | space-folder3.psec |
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['space-folder1.psec', 'space-folder2.psec', 'space-folder3.psec']
    })

    // And "Alice" navigates to the personal space page
    await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })

    // When "Alice" opens folder ".PasswordProtectedFolders/projects/team"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: '.PasswordProtectedFolders/projects/team'
    })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource      |
    //   | space-folder1 |
    //   | space-folder2 |
    //   | space-folder3 |
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['space-folder1', 'space-folder2', 'space-folder3']
    })

    // Opening
    // When "Alice" navigates to the projects space page
    await ui.userNavigatesToSpacesPage({ world, stepUser: 'Alice' })

    // And "Alice" navigates to the project space "team.1"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" opens folder "space-folder1.psec"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: 'space-folder1.psec'
    })

    // And "Alice" unlocks password protected folder with password "%public%"
    await ui.userUnlocksPasswordProtectedFolderWithPassword({
      world,
      stepUser: 'Alice',
      password: '%public%'
    })

    // And "Alice" closes the password protected folder modal
    await ui.userClosesThePasswordProtectedFolderModal({
      world,
      stepUser: 'Alice'
    })

    // Opening by space member
    // And "Brian" logs in
    await ui.userLogsIn({ world, stepUser: 'Brian' })

    // And "Brian" enables the option to display the hidden file
    await ui.userEnablesShowHiddenFilesOption({ world, stepUser: 'Brian' })

    // When "Brian" navigates to the projects space page
    await ui.userNavigatesToSpacesPage({ world, stepUser: 'Brian' })

    // And "Brian" navigates to the project space "team.1"
    await ui.userNavigatesToSpace({ world, stepUser: 'Brian', space: 'team.1' })

    // And "Brian" opens folder "space-folder1.psec"
    await ui.userOpensResource({
      world,
      stepUser: 'Brian',
      resource: 'space-folder1.psec'
    })

    // And "Brian" unlocks password protected folder with password "%public%"
    await ui.userUnlocksPasswordProtectedFolderWithPassword({
      world,
      stepUser: 'Brian',
      password: '%public%'
    })

    // And "Brian" closes the password protected folder modal
    await ui.userClosesThePasswordProtectedFolderModal({
      world,
      stepUser: 'Brian'
    })

    // Deletion
    // When "Alice" navigates to the personal space page
    await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })

    // And "Alice" opens folder ".PasswordProtectedFolders/projects/team"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: '.PasswordProtectedFolders/projects/team'
    })

    // And "Alice" deletes the following resources using the sidebar panel
    //   | resource      |
    //   | space-folder3 |
    await ui.userDeletesResources({
      world,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resources: [{ name: 'space-folder3' }]
    })

    // And "Alice" navigates to the projects space page
    await ui.userNavigatesToSpacesPage({ world, stepUser: 'Alice' })

    // And "Alice" navigates to the project space "team.1"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" deletes the following resources using the sidebar panel
    //   | resource           |
    //   | space-folder1.psec |
    await ui.userDeletesResources({
      world,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resources: [{ name: 'space-folder1.psec' }]
    })

    // And "Alice" navigates to the projects space page
    await ui.userNavigatesToSpacesPage({ world, stepUser: 'Alice' })

    // And "Alice" navigates to the project space "team.1"
    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    // Then following resources should not be displayed in the files list for user "Alice"
    //   | resource           |
    //   | space-folder1.psec |
    //   | space-folder3.psec |
    await ui.userShouldNotSeeTheResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['space-folder1.psec', 'space-folder3.psec']
    })

    // Deletion by space-member
    // When "Brian" deletes the following resources using the sidebar panel
    //   | resource           |
    //   | space-folder2.psec |
    await ui.userDeletesResources({
      world,
      stepUser: 'Brian',
      actionType: 'SIDEBAR_PANEL',
      resources: [{ name: 'space-folder2.psec' }]
    })

    // And "Brian" navigates to the trashbin of the project space "team.1"
    await ui.userNavigatesToTrashbinOfSpace({
      world,
      stepUser: 'Brian',
      space: 'team.1'
    })

    // Then following resources should be displayed in the trashbin for user "Brian"
    //   | resource           |
    //   | space-folder1.psec |
    //   | space-folder2.psec |
    //   | space-folder3.psec |
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['space-folder1.psec', 'space-folder2.psec', 'space-folder3.psec']
    })

    // And "Alice" navigates to the trashbin of the project space "team.1"
    await ui.userNavigatesToTrashbinOfSpace({
      world,
      stepUser: 'Alice',
      space: 'team.1'
    })

    // Then following resources should be displayed in the trashbin for user "Alice"
    //   | resource           |
    //   | space-folder1.psec |
    //   | space-folder2.psec |
    //   | space-folder3.psec |
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['space-folder1.psec', 'space-folder2.psec', 'space-folder3.psec']
    })

    // When "Alice" navigates to the personal space page
    await ui.userNavigatesToPersonalSpacePage({ world, stepUser: 'Alice' })

    // And "Alice" opens folder ".PasswordProtectedFolders/projects/team"
    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: '.PasswordProtectedFolders/projects/team'
    })

    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource      |
    //   | space-folder2 |
    await ui.userShouldSeeResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['space-folder2']
    })

    // And following resources should not be displayed in the files list for user "Alice"
    //   | resource      |
    //   | space-folder1 |
    //   | space-folder3 |
    await ui.userShouldNotSeeTheResources({
      world,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['space-folder1', 'space-folder3']
    })

    // And "Brian" logs out
    await ui.userLogsOut({ world, stepUser: 'Brian' })

    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})
