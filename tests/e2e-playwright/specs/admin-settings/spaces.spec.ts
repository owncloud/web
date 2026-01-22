import { test, expect } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  SpacesEnvironment,
  UsersEnvironment
} from '../../../e2e/support/environment'
import { createdSpaceStore } from '../../../e2e/support/store'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('spaces management', () => {
  let actorsEnvironment
  let spacesEnvironment
  const usersEnvironment = new UsersEnvironment()

  test.beforeEach(async ({ browser }) => {
    createdSpaceStore.clear()
    spacesEnvironment = new SpacesEnvironment()
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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
  })

  test.afterEach(async () => {
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.userHasDeletedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      id: 'team.a'
    })
  })

  test('spaces can be created', async () => {
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      names: ['team A'],
      ids: ['team.a']
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.navigateToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.createProjectSpaces({
      actorsEnvironment,
      stepUser: 'Alice',
      names: ['team B'],
      ids: ['team.b']
    })
    expect(
      await ui.shouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Alice',
        expectedSpaceIds: ['team.a', 'team.b']
      })
    ).toBeTruthy()
    await api.userHasDeletedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      id: 'team.b'
    })
  })

  test('spaces can be managed in the admin settings via the context menu', async () => {
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [{ id: 'Brian', role: 'Space Admin' }]
    })
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      names: ['team A', 'team B'],
      ids: ['team.a', 'team.b']
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.navigateToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.updateSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      key: 'team.a',
      attribute: 'name',
      value: 'team A updated'
    })
    await ui.updateSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      key: 'team.b',
      attribute: 'subtitle',
      value: 'Developer team-subtitle'
    })
    await ui.updateSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      key: 'team.b',
      attribute: 'quota',
      value: '50'
    })
    await ui.disableSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceId: 'team.a'
    })
    await ui.enableSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceId: 'team.a'
    })
    expect(
      await ui.shouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Alice',
        expectedSpaceIds: ['team.a', 'team.b']
      })
    ).toBeTruthy()
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Brian', name: 'admin-settings' })
    await ui.navigateToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Brian' })
    await ui.disableSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Brian',
      spaceId: 'team.b'
    })
    await ui.deleteSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Brian',
      spaceId: 'team.b'
    })
    expect(
      await ui.shouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Brian',
        expectedSpaceIds: ['team.b']
      })
    ).toBeFalsy()
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    await api.userHasDeletedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      id: 'team.b'
    })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('multiple spaces can be managed at once in the admin settings via the batch actions', async () => {
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      names: ['team A', 'team B', 'team C', 'team D'],
      ids: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.navigateToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.disableSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.enableSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.changeSpaceQuotaUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d'],
      value: '50'
    })
    await ui.disableSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.deleteSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    expect(
      await ui.shouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Alice',
        expectedSpaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
      })
    ).toBeFalsy()
  })

  test('list members via sidebar', async () => {
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'carol' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'David' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Edith' })
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      names: ['team A'],
      ids: ['team.a']
    })
    await api.addMembersToProjectSpace({
      usersEnvironment,
      stepUser: 'Admin',
      spaceName: 'team A',
      members: [
        { user: 'Brian', shareType: 'user', role: 'Can edit' },
        { user: 'Carol', shareType: 'user', role: 'Can view' },
        { user: 'David', shareType: 'user', role: 'Can view' },
        { user: 'Edith', shareType: 'user', role: 'Can view' }
      ]
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.navigateToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.listMembersOfProjectSpaceUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Alice',
      space: 'team.a'
    })
    await ui.shouldSeeUsersInSidebarPanelOfSpacesAdminSettings({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedMembers: [
        { user: 'Admin', role: 'Can manage' },
        { user: 'Brian', role: 'Can edit' },
        { user: 'Carol', role: 'Can view' },
        { user: 'David', role: 'Can view' },
        { user: 'Edith', role: 'Can view' }
      ]
    })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'David' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Edith' })
  })

  test('admin user can manage the spaces created by other space admin user', async () => {
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Carol' })
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [
        { id: 'Alice', role: 'Admin' },
        { id: 'Brian', role: 'Space Admin' },
        { id: 'Carol', role: 'Space Admin' }
      ]
    })
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Brian',
      names: ['team A'],
      ids: ['team.a']
    })
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Carol',
      names: ['team B'],
      ids: ['team.b']
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.navigateToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.changeSpaceQuotaUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b'],
      value: '50'
    })
    await ui.disableSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.enableSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.disableSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.deleteSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    expect(
      await ui.shouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Alice',
        expectedSpaceIds: ['team.a', 'team.b']
      })
    ).toBeFalsy()
    await api.userHasDeletedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      id: 'team.b'
    })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
  })
})
