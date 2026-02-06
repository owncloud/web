import { expect, test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  SpacesEnvironment,
  FilesEnvironment,
  LinksEnvironment
} from '../../../e2e/support/environment/index.js'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe('check files pagination in project space', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const spacesEnvironment = new SpacesEnvironment()
  const filesEnvironment = new FilesEnvironment()
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
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'David' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Edith' })
  })

  test('pagination', async () => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    //   | Carol |
    //   | David |
    //   | Edith |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Carol' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'David' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Edith' })

    // And "Admin" creates following group using API
    //   | id       |
    //   | sales    |
    //   | security |
    await api.userHasCreatedGroup({ usersEnvironment, stepUser: 'Admin', groupId: 'sales' })
    await api.userHasCreatedGroup({ usersEnvironment, stepUser: 'Admin', groupId: 'security' })

    // And "Admin" adds user to the group using API
    //   | user  | group    |
    //   | David | sales    |
    //   | Edith | security |
    await api.addUserToGroup({
      usersEnvironment,
      stepUser: 'Admin',
      groupName: 'sales',
      userToAdd: 'David'
    })

    await api.addUserToGroup({
      usersEnvironment,
      stepUser: 'Admin',
      groupName: 'security',
      userToAdd: 'Edith'
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

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following project space using API
    //   | name | id     |
    //   | team | team.1 |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'team',
      id: 'team.1'
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" adds following users to the project space
    //   | user     | role     | kind  |
    //   | Brian    | Can edit | user  |
    //   | Carol    | Can view | user  |
    //   | sales    | Can view | group |
    //   | security | Can edit | group |
    await ui.addMembersToSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      sharee: 'Brian',
      role: 'Can edit with versions and trashbin',
      kind: 'user'
    })
    await ui.addMembersToSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      sharee: 'Carol',
      role: 'Can view',
      kind: 'user'
    })
    await ui.addMembersToSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      sharee: 'sales',
      role: 'Can view',
      kind: 'group'
    })
    await ui.addMembersToSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      sharee: 'security',
      role: 'Can edit with versions and trashbin',
      kind: 'group'
    })

    // When "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Brian" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Brian', space: 'team.1' })

    // And "Brian" creates the following resources
    //   | resource | type   |
    //   | parent   | folder |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'parent',
      type: 'folder'
    })

    // And "Brian" uploads the following resources
    //   | resource  | to     |
    //   | lorem.txt | parent |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resource: 'lorem.txt',
      to: 'parent'
    })

    // When "David" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'David' })

    // And "David" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'David', space: 'team.1' })

    // Then "David" should not be able to edit folder "parent"
    expect(
      await ui.isAbleToEditFileOrFolder({
        actorsEnvironment,
        stepUser: 'David',
        resource: 'parent'
      })
    ).toBeFalsy()

    // And "David" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'David' })

    // When "Edith" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Edith' })

    // And "Edith" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Edith', space: 'team.1' })

    // And "Edith" creates the following resources
    //   | resource | type   |
    //   | edith    | folder |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Edith',
      resource: 'edith',
      type: 'folder'
    })

    // And "Edith" uploads the following resources
    //   | resource  | to    |
    //   | lorem.txt | edith |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Edith',
      resource: 'lorem.txt',
      to: 'edith'
    })

    // And "Edith" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Edith' })

    // When "Carol" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Carol' })

    // And "Carol" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Carol', space: 'team.1' })

    // Then "Carol" should not be able to edit folder "parent"
    expect(
      await ui.isAbleToEditFileOrFolder({
        actorsEnvironment,
        stepUser: 'Carol',
        resource: 'parent'
      })
    ).toBeFalsy()

    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource | role     | password |
    //   | parent   | Can edit | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'parent',
      role: 'Can edit',
      password: '%public%'
    })

    // And "Anonymous" opens the public link "Unnamed link"
    await ui.openPublicLink({
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

    // And "Anonymous" uploads the following resources in public link page
    //   | resource     |
    //   | textfile.txt |
    await ui.uploadResourceInPublicLink({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Anonymous',
      resource: 'textfile.txt'
    })

    // And "Anonymous" deletes the following resources from public link using sidebar panel
    //   | resource  | from |
    //   | lorem.txt |      |
    await ui.deleteResourceFromPublicLink({
      actorsEnvironment,
      stepUser: 'Anonymous',
      file: 'lorem.txt',
      actionType: 'sidebar panel'
    })

    // When "Brian" deletes the following resources using the sidebar panel
    //   | resource     | from   |
    //   | textfile.txt | parent |
    await ui.deleteResource({
      actorsEnvironment,
      stepUser: 'Brian',
      file: 'textfile.txt',
      actionType: 'sidebar panel',
      parentFolder: 'parent'
    })

    // When "Carol" navigates to the trashbin of the project space "team.1"
    await ui.navigateToTrashbin({ actorsEnvironment, stepUser: 'Carol', space: 'team.1' })

    // Then "Carol" should not be able to delete following resources from the trashbin
    //   | resource            |
    //   | parent/lorem.txt    |
    //   | parent/textfile.txt |
    await ui.deleteResourceFromTrashbin({
      actorsEnvironment,
      stepUser: 'Carol',
      resource: 'parent/textfile.txt',
      actionType: 'should not'
    })
    await ui.deleteResourceFromTrashbin({
      actorsEnvironment,
      stepUser: 'Carol',
      resource: 'parent/lorem.txt',
      actionType: 'should not'
    })

    // And "Carol" should not be able to restore following resources from the trashbin
    //   | resource            |
    //   | parent/lorem.txt    |
    //   | parent/textfile.txt |
    await ui.restoreDeletedResourceFromTrashbin({
      actorsEnvironment,
      stepUser: 'Carol',
      resource: 'parent/lorem.txt',
      actionType: 'should not'
    })
    await ui.restoreDeletedResourceFromTrashbin({
      actorsEnvironment,
      stepUser: 'Carol',
      resource: 'parent/textfile.txt',
      actionType: 'should not'
    })

    // When "Brian" navigates to the trashbin of the project space "team.1"
    await ui.navigateToTrashbin({ actorsEnvironment, stepUser: 'Brian', space: 'team.1' })

    // Then "Brian" should be able to restore following resource from the trashbin
    //   | resource         |
    //   | parent/lorem.txt |
    await ui.restoreDeletedResourceFromTrashbin({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'parent/lorem.txt',
      actionType: 'should'
    })

    // And "Brian" should not be able to delete following resource from the trashbin
    //   | resource            |
    //   | parent/textfile.txt |
    await ui.deleteResourceFromTrashbin({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'parent/textfile.txt',
      actionType: 'should not'
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" removes access to following users from the project space
    //   | user  |
    //   | Brian |
    await ui.removeAccessToMember({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      reciver: 'Brian',
      role: 'role'
    })

    // Then "Brian" should not see space "team.1"
    await ui.userShouldNotSeeSpace({
      actorsEnvironment,
      stepUser: 'Brian',
      space: 'team.1'
    })

    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })

    // When "Alice" changes the roles of the following users in the project space
    //   | user  | role       |
    //   | Carol | Can manage |
    await ui.userChangesMemberRole({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      role: 'Can manage',
      sharee: 'Carol'
    })

    // And "Carol" navigates to the trashbin of the project space "team.1"
    await ui.navigateToTrashbin({ actorsEnvironment, stepUser: 'Carol', space: 'team.1' })

    // Then "Carol" should be able to delete following resource from the trashbin
    //   | resource            |
    //   | parent/textfile.txt |
    await ui.deleteResourceFromTrashbin({
      actorsEnvironment,
      stepUser: 'Carol',
      resource: 'parent/textfile.txt',
      actionType: 'should'
    })

    // And "Carol" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Carol' })

    // And "Alice" as project manager removes their own access to the project space
    await ui.removeAccessToMember({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      reciver: 'Alice',
      role: 'Can manage'
    })

    // Then "Alice" should not see space "team.1"
    await ui.userShouldNotSeeSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      space: 'team.1'
    })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
