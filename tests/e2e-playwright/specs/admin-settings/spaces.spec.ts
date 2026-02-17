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
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Alice'] })
  })

  test.afterEach(async () => {
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.userHasDeletedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      id: 'team.a',
      name: 'team A'
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
      spaces: [{ name: 'team A', id: 'team.a' }]
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.userCreatesProjectSpaces({
      actorsEnvironment,
      stepUser: 'Alice',
      spaces: [{ name: 'team B', id: 'team.b' }]
    })
    expect(
      await ui.userShouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Alice',
        expectedSpaceIds: ['team.a', 'team.b']
      })
    ).toBeTruthy()
    await api.userHasDeletedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      name: 'team B',
      id: 'team.b'
    })
  })

  test('spaces can be managed in the admin settings via the context menu', async () => {
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Brian'] })
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
      spaces: [
        { name: 'team A', id: 'team.a' },
        { name: 'team B', id: 'team.b' }
      ]
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.userUpdatesSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      key: 'team.a',
      attribute: 'name',
      value: 'team A updated'
    })
    await ui.userUpdatesSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      key: 'team.b',
      attribute: 'subtitle',
      value: 'Developer team-subtitle'
    })
    await ui.userUpdatesSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      key: 'team.b',
      attribute: 'quota',
      value: '50'
    })
    await ui.userDisablesSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceId: 'team.a'
    })
    await ui.userEnablesSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceId: 'team.a'
    })
    expect(
      await ui.userShouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Alice',
        expectedSpaceIds: ['team.a', 'team.b']
      })
    ).toBeTruthy()
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Brian', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Brian' })
    await ui.userDisablesSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Brian',
      spaceId: 'team.b'
    })
    await ui.userDeletesSpaceUsingContextMenu({
      actorsEnvironment,
      stepUser: 'Brian',
      spaceId: 'team.b'
    })
    expect(
      await ui.userShouldSeeSpaces({
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
      id: 'team.b',
      name: 'team B'
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
      spaces: [
        { name: 'team A', id: 'team.a' },
        { name: 'team B', id: 'team.b' },
        { name: 'team C', id: 'team.c' },
        { name: 'team D', id: 'team.d' }
      ]
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.userDisablesSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.userEnablesSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.userChangesSpaceQuotaUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d'],
      value: '50'
    })
    await ui.userDisablesSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.userDeletesSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    expect(
      await ui.userShouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Alice',
        expectedSpaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
      })
    ).toBeFalsy()
  })

  test('list members via sidebar', async () => {
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Brian'] })
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Carol'] })
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['David'] })
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Edith'] })
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      spaces: [{ name: 'team A', id: 'team.a' }]
    })
    await api.userHasAddedMembersToSpace({
      usersEnvironment,
      stepUser: 'Admin',
      space: 'team A',
      sharee: [
        { user: 'Brian', shareType: 'user', role: 'Can edit with versions and trashbin' },
        { user: 'Carol', shareType: 'user', role: 'Can view' },
        { user: 'David', shareType: 'user', role: 'Can view' },
        { user: 'Edith', shareType: 'user', role: 'Can view' }
      ]
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
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
        { user: 'Brian', role: 'Can edit with versions and trashbin' },
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
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Brian'] })
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Carol'] })
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
      spaces: [{ name: 'team A', id: 'team.a' }]
    })
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Carol',
      spaces: [{ name: 'team B', id: 'team.b' }]
    })
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.userChangesSpaceQuotaUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b'],
      value: '50'
    })
    await ui.userDisablesSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.userEnablesSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.userDisablesSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.userDeletesSpacesUsingBatchActions({
      actorsEnvironment,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    expect(
      await ui.userShouldSeeSpaces({
        actorsEnvironment,
        stepUser: 'Alice',
        expectedSpaceIds: ['team.a', 'team.b']
      })
    ).toBeFalsy()
    await api.userHasDeletedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Admin',
      id: 'team.b',
      name: 'team B'
    })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Carol' })
  })
})
