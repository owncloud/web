import { test } from '../../environment/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('users management', () => {
  test.beforeEach(async ({ world }) => {
    await ui.userLogsIn({ world, stepUser: 'Admin' })
  })

  test.afterEach(async ({ world }) => {
    await ui.userLogsOut({ world, stepUser: 'Admin' })
  })

  test('user login can be managed in the admin settings', async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice'] })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userForbidsLoginForUserUsingContextMenu({
      world,
      stepUser: 'Admin',
      key: 'Alice'
    })
    await ui.userFailsToLogin({
      world,
      stepUser: 'Alice'
    })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userAllowsLoginForUserUsingContextMenu({
      world,
      stepUser: 'Admin',
      key: 'Alice'
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })

  test('admin user can change personal quotas for users', async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice', 'Brian'] })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userChangesQuotaOfUserUsingContextMenu({
      world,
      stepUser: 'Admin',
      key: 'Alice',
      value: '500'
    })
    await ui.userShouldHaveQuota({
      world,
      stepUser: 'Alice',
      quota: '500'
    })
    await ui.userChangesQuotaForUsersUsingBatchAction({
      world,
      stepUser: 'Admin',
      value: '20',
      users: ['Alice', 'Brian']
    })
    await ui.userShouldHaveQuota({
      world,
      stepUser: 'Alice',
      quota: '20'
    })
    await ui.userShouldHaveQuota({
      world,
      stepUser: 'Brian',
      quota: '20'
    })
    await ui.userLogsOut({ world, stepUser: 'Alice' })
    await ui.userLogsOut({ world, stepUser: 'Brian' })
  })

  test('user group assignments can be handled via batch actions', async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice', 'Brian', 'Carol'] })
    await api.groupsHaveBeenCreated({
      world,
      stepUser: 'Admin',
      groupIds: ['sales', 'finance']
    })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userAddsUsersToGroupsUsingBatchActions({
      world,
      stepUser: 'Admin',
      assignments: [
        { group: 'sales', users: ['Alice', 'Brian', 'Carol'] },
        { group: 'finance', users: ['Alice', 'Brian', 'Carol'] }
      ]
    })
    await ui.userSetsFilters({
      world,
      stepUser: 'Admin',
      filters: [{ filter: 'groups', values: ['sales department', 'finance department'] }]
    })
    await ui.usersShouldBeVisible({
      world,
      stepUser: 'Admin',
      expectedUsers: ['Alice', 'Brian', 'Carol']
    })
    await ui.userRemovesUsersFromGroupsUsingBatchActions({
      world,
      stepUser: 'Admin',
      assignments: [
        { user: 'Alice', groups: ['sales', 'finance'] },
        { user: 'Brian', groups: ['sales', 'finance'] }
      ]
    })
    await ui.userReloadsPage({ world, stepUser: 'Admin' })
    await ui.usersShouldBeVisible({
      world,
      stepUser: 'Admin',
      expectedUsers: ['Carol']
    })
    await ui.usersShouldNotBeVisible({
      world,
      stepUser: 'Admin',
      expectedUsers: ['Alice', 'Brian']
    })
  })

  test('edit user', async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice'] })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userUpdatesUserAttributeUsingContextMenu({
      world,
      stepUser: 'Admin',
      user: 'Alice',
      attribute: 'userName',
      value: 'anna'
    })
    await ui.userUpdatesUserAttributeUsingContextMenu({
      world,
      stepUser: 'Admin',
      user: 'anna',
      attribute: 'displayName',
      value: 'Anna Murphy'
    })
    await ui.userUpdatesUserAttributeUsingContextMenu({
      world,
      stepUser: 'Admin',
      user: 'anna',
      attribute: 'email',
      value: 'anna@example.org'
    })
    await ui.userUpdatesUserAttributeUsingContextMenu({
      world,
      stepUser: 'Admin',
      user: 'anna',
      attribute: 'password',
      value: 'password'
    })
    await ui.userUpdatesUserAttributeUsingContextMenu({
      world,
      stepUser: 'Admin',
      user: 'anna',
      attribute: 'role',
      value: 'Space Admin'
    })
    await ui.userLogsIn({ world, stepUser: 'anna' })
    await ui.userShouldHaveSelfInfo({
      world,
      stepUser: 'anna',
      info: [
        { key: 'username', value: 'anna' },
        { key: 'displayname', value: 'Anna Murphy' },
        { key: 'email', value: 'anna@example.org' }
      ]
    })
    await ui.userLogsOut({ world, stepUser: 'anna' })
  })

  test('assign user to groups', async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice'] })
    await api.groupsHaveBeenCreated({
      world,
      stepUser: 'Admin',
      groupIds: ['sales', 'finance', 'security']
    })
    await api.usersHaveBeenAddedToGroup({
      world,
      stepUser: 'Admin',
      usersToAdd: [{ user: 'Alice', group: 'sales' }]
    })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userAddsUserToGroupsUsingContextMenu({
      world,
      stepUser: 'Admin',
      user: 'Alice',
      groups: ['finance', 'security']
    })
    await ui.userRemovesUserFromGroupsUsingContextMenu({
      world,
      stepUser: 'Admin',
      user: 'Alice',
      groups: ['sales']
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userShouldHaveSelfInfo({
      world,
      stepUser: 'Alice',
      info: [{ key: 'groups', value: 'finance department, security department' }]
    })
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })

  test('delete user', async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian', 'Carol', 'David']
    })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userUpdatesUserAttributeUsingContextMenu({
      world,
      stepUser: 'Admin',
      user: 'David',
      attribute: 'role',
      value: 'Space Admin'
    })
    await ui.userSetsFilters({
      world,
      stepUser: 'Admin',
      filters: [{ filter: 'roles', values: ['User', 'Admin'] }]
    })
    await ui.usersShouldBeVisible({
      world,
      stepUser: 'Admin',
      expectedUsers: ['Alice', 'Brian', 'Carol']
    })
    await ui.usersShouldNotBeVisible({
      world,
      stepUser: 'Admin',
      expectedUsers: ['David']
    })
    await ui.userDeletesUsersUsingBatchActions({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })
    await ui.userDeletesUsersUsingContextMenu({
      world,
      stepUser: 'Admin',
      users: ['Carol']
    })
    await ui.usersShouldNotBeVisible({
      world,
      stepUser: 'Admin',
      expectedUsers: ['Alice', 'Brian', 'Carol']
    })
  })

  test('admin creates user', async ({ world }) => {
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userCreatesUser({
      world,
      stepUser: 'Admin',
      userData: [
        {
          name: 'max',
          displayname: 'Max Testing',
          email: 'maxtesting@owncloud.com',
          password: '12345678'
        }
      ]
    })
    await ui.userLogsIn({ world, stepUser: 'Max' })
    await ui.userShouldHaveSelfInfo({
      world,
      stepUser: 'Max',
      info: [
        { key: 'username', value: 'max' },
        { key: 'displayname', value: 'Max Testing' },
        { key: 'email', value: 'maxtesting@owncloud.com' }
      ]
    })
    await ui.userLogsOut({ world, stepUser: 'Max' })
  })

  test('edit panel can be opened via quick action and context menu', async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice', 'Brian', 'Carol'] })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ world, stepUser: 'Admin' })
    await ui.userOpensEditPanelOfUserUsingQuickAction({
      world,
      stepUser: 'Admin',
      actionUser: 'Brian'
    })
    await ui.userShouldSeeEditPanel({
      world,
      stepUser: 'Admin'
    })
    await ui.userOpensEditPanelOfUserUsingContextMenu({
      world,
      stepUser: 'Admin',
      actionUser: 'Brian'
    })
    await ui.userShouldSeeEditPanel({
      world,
      stepUser: 'Admin'
    })
  })
})
