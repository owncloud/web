import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('users management', () => {
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
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Admin' })
  })

  test.afterEach(async () => {
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Admin' })
  })

  test('user login can be managed in the admin settings', async () => {
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Alice'] })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userForbidsLoginForUserUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'Alice'
    })
    await ui.userFailsToLogin({
      usersEnvironment,
      actorsEnvironment,
      stepUser: 'Alice'
    })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userAllowsLoginForUserUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'Alice'
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('admin user can change personal quotas for users', async () => {
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userChangesQuotaForUserUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'Alice',
      value: '500'
    })
    await ui.userShouldHaveQuota({
      actorsEnvironment,
      stepUser: 'Alice',
      quota: '500'
    })
    await ui.userChangesQuotaForUsersUsingBatchAction({
      actorsEnvironment,
      stepUser: 'Admin',
      value: '20',
      users: ['Alice', 'Brian']
    })
    await ui.userShouldHaveQuota({
      actorsEnvironment,
      stepUser: 'Alice',
      quota: '20'
    })
    await ui.userShouldHaveQuota({
      actorsEnvironment,
      stepUser: 'Brian',
      quota: '20'
    })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('user group assignments can be handled via batch actions', async () => {
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian', 'Carol']
    })
    await api.groupsHaveBeenCreated({
      groupIds: ['sales', 'security', 'finance'],
      admin: usersEnvironment.getUser({ key: 'Admin' })
    })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userAddsUsersToGroupsUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Admin',
      groups: ['sales', 'finance'],
      users: ['Alice', 'Brian', 'Carol']
    })
    await ui.userSetsFilters({
      actorsEnvironment,
      stepUser: 'Admin',
      filters: [{ filter: 'groups', values: ['sales department', 'finance department'] }]
    })
    await ui.usersShouldBeVisible({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedUsers: ['Alice', 'Brian']
    })
    await ui.userRemovesUsersFromGroupsUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Admin',
      groups: ['sales', 'finance'],
      users: ['Alice', 'Brian']
    })
    await ui.userReloadsPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.usersShouldBeVisible({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedUsers: ['Carol']
    })
    await ui.usersShouldNotBeVisible({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedUsers: ['Alice', 'Brian']
    })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
  })

  test('edit user', async () => {
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Alice'] })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userChangesUserNameUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'Alice',
      value: 'anna'
    })
    await ui.userChangesUserDisplayNameUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'anna',
      value: 'Anna Murphy'
    })
    await ui.userChangesUserEmailUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'anna',
      value: 'anna@example.org'
    })
    await ui.userChangesUserPasswordUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'anna',
      value: 'password'
    })
    await ui.userChangesUserRoleUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'anna',
      value: 'Space Admin'
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'anna' })
    await ui.userShouldHaveSelfInfo({
      actorsEnvironment,
      stepUser: 'anna',
      info: [
        { key: 'username', value: 'anna' },
        { key: 'displayname', value: 'Anna Murphy' },
        { key: 'email', value: 'anna@example.org' }
      ]
    })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'anna' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'anna' })
  })

  test('assign user to groups', async () => {
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Alice'] })
    await api.groupsHaveBeenCreated({
      groupIds: ['sales', 'security', 'finance'],
      admin: usersEnvironment.getUser({ key: 'Admin' })
    })
    await api.usersHaveBeenAddedToGroup({
      usersEnvironment,
      stepUser: 'Admin',
      usersToAdd: [{ user: 'Alice', group: 'sales' }]
    })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userAddsUserToGroupsUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      user: 'Alice',
      groups: ['finance', 'security']
    })
    await ui.userRemovesUserFromGroupsUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      user: 'Alice',
      groups: ['sales']
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.userShouldHaveSelfInfo({
      actorsEnvironment,
      stepUser: 'Alice',
      info: [{ key: 'groups', value: 'security department, finance department' }]
    })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('delete user', async () => {
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian', 'Carol', 'David']
    })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userChangesUserRoleUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'David',
      value: 'Space Admin'
    })
    await ui.userSetsFilters({
      actorsEnvironment,
      stepUser: 'Admin',
      filters: [{ filter: 'roles', values: ['User', 'Admin'] }]
    })
    await ui.usersShouldBeVisible({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedUsers: ['Alice', 'Brian', 'Carol']
    })
    await ui.usersShouldNotBeVisible({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedUsers: ['David']
    })
    await ui.userDeletesUsersUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })
    await ui.userDeletesUsersUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Admin',
      users: ['Carol']
    })
    await ui.usersShouldNotBeVisible({
      actorsEnvironment,
      stepUser: 'Admin',
      expectedUsers: ['Alice', 'Brian', 'Carol']
    })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'David' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
  })

  test('admin creates user', async () => {
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userCreatesUser({
      actorsEnvironment,
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
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Max' })
    await ui.userShouldHaveSelfInfo({
      actorsEnvironment,
      stepUser: 'Max',
      info: [
        { key: 'username', value: 'max' },
        { key: 'displayname', value: 'Max Testing' },
        { key: 'email', value: 'maxtesting@owncloud.com' }
      ]
    })
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Max' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Max' })
  })

  test('edit panel can be opened via quick action and context menu', async () => {
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian', 'Carol']
    })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToUsersManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userOpensEditPanelOfUserUsingQuickAction({
      actorsEnvironment,
      stepUser: 'Admin',
      actionUser: 'Brian'
    })
    await ui.userShouldSeeEditPanel({
      actorsEnvironment,
      stepUser: 'Admin'
    })
    await ui.userOpensEditPanelOfUserUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Admin',
      actionUser: 'Brian'
    })
    await ui.userShouldSeeEditPanel({
      actorsEnvironment,
      stepUser: 'Admin'
    })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
  })
})
