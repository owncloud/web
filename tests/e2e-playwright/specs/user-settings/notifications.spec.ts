import { test, expect } from '@playwright/test'
import { config } from './../../../e2e/config.js'
import {
  ActorsEnvironment,
  SpacesEnvironment,
  UsersEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { substitute } from '../../../e2e/support/utils/substitute.js'

test.describe('Notifications', () => {
  let actorsEnvironment: ActorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const spacesEnvironment = new SpacesEnvironment()

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
    //   | Brian |
    //   | Carol |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Carol' })

    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })
  })

  test.afterEach(async () => {
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Carol' })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
    await api.userHasDeletedProjectSpace({
      usersEnvironment,
      stepUser: 'Admin',
      name: 'team',
      id: 'team.1'
    })
  })

  test('user should be able to read and dismiss notifications', async () => {
    // Given "Admin" creates following groups using API
    //   | id    |
    //   | sales |
    await api.userHasCreatedGroup({ usersEnvironment, stepUser: 'Admin', groupId: 'sales' })

    // And "Admin" adds user to the group using API
    //   | user  | group |
    //   | Alice | sales |
    //   | Brian | sales |
    await api.addUserToGroup({
      usersEnvironment,
      stepUser: 'Admin',
      groupName: 'sales',
      userToAdd: 'Alice'
    })
    await api.addUserToGroup({
      usersEnvironment,
      stepUser: 'Admin',
      groupName: 'sales',
      userToAdd: 'Brian'
    })

    // And "Alice" creates the following folder in personal space using API
    //   | name             |
    //   | folder_to_shared |
    //   | share_to_group   |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['folder_to_shared', 'share_to_group']
    })

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

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // When "Alice" shares the following resource using the sidebar panel
    //   | resource         | recipient | type  | role                      | resourceType |
    //   | folder_to_shared | Brian     | user  | Can edit without versions | folder       |
    //   | share_to_group   | sales     | group | Can edit without versions | folder       |
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resource: 'folder_to_shared',
      recipient: 'Brian',
      type: 'user',
      role: 'Can edit with trashbin',
      resourceType: 'folder'
    })
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resource: 'share_to_group',
      recipient: 'sales',
      type: 'group',
      role: 'Can edit with trashbin',
      resourceType: 'folder'
    })

    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // Then "Brian" should see the following notifications
    // | message                                                   |
    // | %user_alice_displayName% shared folder_to_shared with you |
    // | %user_alice_displayName% shared share_to_group with you   |
    let messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Brian' })
    expect(messages).toContain(
      substitute('%user_alice_displayName% shared folder_to_shared with you')
    )
    expect(messages).toContain(
      substitute('%user_alice_displayName% shared share_to_group with you')
    )

    // And "Brian" marks all notifications as read
    await ui.userMarksNotificationsAsRead({
      actorsEnvironment,
      stepUser: 'Brian'
    })

    // When "Alice" removes following sharee
    //   | resource         | recipient |
    //   | folder_to_shared | Brian     |
    await ui.removeSharee({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared',
      recipient: 'Brian'
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" adds following users to the project space
    //   | user  | role     | kind |
    //   | Brian | Can edit | user |
    //   | Carol | Can edit | user |
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
      role: 'Can edit with versions and trashbin',
      kind: 'user'
    })

    // Then "Alice" should see no notifications
    messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Alice' })
    expect(messages).toHaveLength(0)

    // And "Brian" should see the following notifications
    //   | message                                         |
    //   | %user_alice_displayName% unshared folder_to_shared with you |
    //   | %user_alice_displayName% added you to Space team            |
    messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Brian' })
    expect(messages).toContain(
      substitute('%user_alice_displayName% unshared folder_to_shared with you')
    )
    expect(messages).toContain(substitute('%user_alice_displayName% added you to Space team'))

    // And "Brian" marks all notifications as read
    await ui.userMarksNotificationsAsRead({
      actorsEnvironment,
      stepUser: 'Brian'
    })

    // When "Alice" removes access to following users from the project space
    //   | user  | role                      | kind |
    //   | Carol | Can edit without versions | user |
    await ui.removeAccessToMember({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      reciver: 'Carol',
      role: 'Can edit with trashbin'
    })

    // And "Carol" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Carol' })

    // And "Carol" should see the following notifications
    //   | message                                              |
    //   | %user_alice_displayName% added you to Space team     |
    //   | %user_alice_displayName% removed you from Space team |
    messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Carol' })
    expect(messages).toContain(substitute('%user_alice_displayName% added you to Space team'))
    expect(messages).toContain(substitute('%user_alice_displayName% removed you from Space team'))

    // When "Alice" opens the "admin-settings" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })

    // And "Alice" navigates to the project spaces management page
    await ui.navigateToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" disables the space "team.1" using the context-menu
    await ui.manageSpaceUsingContexMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      action: 'disables',
      space: 'team.1'
    })

    // Then "Brian" should see the following notifications
    //  | message                          |
    //  | %user_alice_displayName% disabled Space team |
    messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Brian' })
    expect(messages).toContain(substitute('%user_alice_displayName% disabled Space team'))

    // When "Alice" deletes the space "team.1" using the context-menu
    await ui.manageSpaceUsingContexMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      action: 'deletes',
      space: 'team.1'
    })

    // Then "Brian" should see the following notifications
    //   | message                         |
    //   | %user_alice_displayName% deleted Space team |
    messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Brian' })
    expect(messages).toContain(substitute('%user_alice_displayName% deleted Space team'))

    await api.userHasDeletedGroup({ usersEnvironment, stepUser: 'Admin', name: 'sales' })
  })

  test('user should not get any notification when notification is disabled', async () => {
    // Given "Alice" creates the following folder in personal space using API
    //   | name             |
    //   | folder_to_shared |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Alice',
      folderName: 'folder_to_shared'
    })

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

    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Brian" opens the user menu
    await ui.userOpensAccountPage({ actorsEnvironment, stepUser: 'Brian' })

    // When "Brian" disables notification for the following events
    //   | event                   |
    //   | Share Received          |
    //   | Share Removed           |
    //   | Added as space member   |
    //   | Removed as space member |
    await ui.disableNotificationEvent({
      actorsEnvironment,
      stepUser: 'Brian',
      event: 'Share Received'
    })
    await ui.disableNotificationEvent({
      actorsEnvironment,
      stepUser: 'Brian',
      event: 'Share Removed'
    })
    await ui.disableNotificationEvent({
      actorsEnvironment,
      stepUser: 'Brian',
      event: 'Added as space member'
    })
    await ui.disableNotificationEvent({
      actorsEnvironment,
      stepUser: 'Brian',
      event: 'Removed as space member'
    })

    // And "Carol" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Carol' })

    // And "Carol" opens the user menu
    await ui.userOpensAccountPage({ actorsEnvironment, stepUser: 'Carol' })

    // And "Carol" disables notification for the following events
    //   | event          |
    //   | Space disabled |
    //   | Space deleted  |
    await ui.disableNotificationEvent({
      actorsEnvironment,
      stepUser: 'Brian',
      event: 'Space disabled'
    })
    await ui.disableNotificationEvent({
      actorsEnvironment,
      stepUser: 'Brian',
      event: 'Space deleted'
    })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" shares the following resource using the sidebar panel
    //   | resource         | recipient | type  | role                      | resourceType |
    //   | folder_to_shared | Brian     | user  | Can edit without versions | folder       |
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resource: 'folder_to_shared',
      recipient: 'Brian',
      type: 'user',
      role: 'Can edit with trashbin',
      resourceType: 'folder'
    })

    // When "Alice" removes following sharee
    //   | resource         | recipient |
    //   | folder_to_shared | Brian     |
    await ui.removeSharee({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared',
      recipient: 'Brian'
    })

    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // And "Alice" adds following users to the project space
    //   | user  | role     | kind |
    //   | Brian | Can edit | user |
    //   | Carol | Can edit | user |
    await ui.addUserToProjectSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      space: 'team.1',
      reciver: 'Brian',
      role: 'Can edit with versions and trashbin',
      kind: 'user'
    })
    await ui.addUserToProjectSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      space: 'team.1',
      reciver: 'Carol',
      role: 'Can edit with versions and trashbin',
      kind: 'user'
    })

    // And "Alice" removes access to following users from the project space
    //   | user  | role     | kind |
    //   | Brian | Can edit | user |
    await ui.removeAccessToMember({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      reciver: 'Carol',
      role: 'Can edit with versions and trashbin'
    })

    // Then "Alice" should see no notifications
    let messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Brian' })
    expect(messages).toHaveLength(0)

    // When "Alice" opens the "admin-settings" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })

    // And "Alice" navigates to the project spaces management page
    await ui.navigateToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" disables the space "team.1" using the context-menu
    await ui.manageSpaceUsingContexMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      action: 'disables',
      space: 'team.1'
    })

    // When "Alice" deletes the space "team.1" using the context-menu
    await ui.manageSpaceUsingContexMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      action: 'deletes',
      space: 'team.1'
    })

    // Then "Carol" should see no notifications
    messages = await ui.getNotificationMessages({ actorsEnvironment, stepUser: 'Carol' })
    expect(messages).toHaveLength(0)
  })
})
