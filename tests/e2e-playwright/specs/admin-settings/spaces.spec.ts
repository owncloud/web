import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('spaces management', () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice'] })
  })

  test.afterEach(async ({ world }) => {
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })

  test('spaces can be created', async ({ world }) => {
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [{ name: 'team A', id: 'team.a' }]
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ world, stepUser: 'Alice' })
    await ui.userCreatesProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [{ name: 'team B', id: 'team.b' }]
    })
    await ui.userShouldSeeSpaces({
      world,
      stepUser: 'Alice',
      expectedSpaceIds: ['team.a', 'team.b']
    })
  })

  test('spaces can be managed in the admin settings via the context menu', async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Brian']
    })
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [
        { id: 'Alice', role: 'Space Admin' },
        { id: 'Brian', role: 'Space Admin' }
      ]
    })
    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [
        { name: 'team A', id: 'team.a' },
        { name: 'team B', id: 'team.b' }
      ]
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ world, stepUser: 'Alice' })
    await ui.userUpdatesSpaceUsingContextMenu({
      world,
      stepUser: 'Alice',
      spaceId: 'team.a',
      updates: [
        { attribute: 'name', value: 'developer team' },
        { attribute: 'subtitle', value: 'developer team-subtitle' },
        { attribute: 'quota', value: '50' }
      ]
    })
    await ui.userDisablesSpaceUsingContextMenu({
      world,
      stepUser: 'Alice',
      spaceId: 'team.a'
    })
    await ui.userEnablesSpaceUsingContextMenu({
      world,
      stepUser: 'Alice',
      spaceId: 'team.a'
    })
    await ui.userShouldSeeSpaces({
      world,
      stepUser: 'Alice',
      expectedSpaceIds: ['team.a']
    })
    await ui.userLogsIn({ world, stepUser: 'Brian' })
    await ui.userOpensApplication({ world, stepUser: 'Brian', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ world, stepUser: 'Brian' })
    await ui.userDisablesSpaceUsingContextMenu({
      world,
      stepUser: 'Brian',
      spaceId: 'team.b'
    })
    await ui.userDeletesSpaceUsingContextMenu({
      world,
      stepUser: 'Brian',
      spaceId: 'team.b'
    })
    await ui.userShouldNotSeeSpaces({
      world,
      stepUser: 'Brian',
      expectedSpaceIds: ['team.b']
    })
    await ui.userLogsOut({ world, stepUser: 'Brian' })
  })

  test('multiple spaces can be managed at once in the admin settings via the batch actions', async ({
    world
  }) => {
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [
        { name: 'team A', id: 'team.a' },
        { name: 'team B', id: 'team.b' },
        { name: 'team C', id: 'team.c' },
        { name: 'team D', id: 'team.d' }
      ]
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ world, stepUser: 'Alice' })
    await ui.userDisablesSpacesUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.userEnablesSpacesUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.userChangesSpaceQuotaUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d'],
      value: '50'
    })
    await ui.userDisablesSpacesUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.userDeletesSpacesUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
    await ui.userShouldNotSeeSpaces({
      world,
      stepUser: 'Alice',
      expectedSpaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
    })
  })

  test('list members via sidebar', async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Brian', 'Carol', 'David', 'Edith']
    })
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })
    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Admin',
      spaces: [{ name: 'team A', id: 'team.a' }]
    })
    await api.userHasAddedMembersToSpace({
      world,
      stepUser: 'Admin',
      space: 'team A',
      sharee: [
        { user: 'Brian', shareType: 'user', role: 'Can edit with versions and trashbin' },
        { user: 'Carol', shareType: 'user', role: 'Can view' },
        { user: 'David', shareType: 'user', role: 'Can view' },
        { user: 'Edith', shareType: 'user', role: 'Can view' }
      ]
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ world, stepUser: 'Alice' })
    await ui.userListsMembersOfProjectSpaceUsingSidebarPanel({
      world,
      stepUser: 'Alice',
      space: 'team.a'
    })
    await ui.userShouldSeeUsersInSidebarPanelOfSpacesAdminSettings({
      world,
      stepUser: 'Alice',
      expectedMembers: [
        { user: 'Admin', role: 'Can manage' },
        { user: 'Brian', role: 'Can edit with versions and trashbin' },
        { user: 'Carol', role: 'Can view' },
        { user: 'David', role: 'Can view' },
        { user: 'Edith', role: 'Can view' }
      ]
    })
  })

  test('admin user can manage the spaces created by other space admin user', async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Brian', 'Carol']
    })
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [
        { id: 'Alice', role: 'Admin' },
        { id: 'Brian', role: 'Space Admin' },
        { id: 'Carol', role: 'Space Admin' }
      ]
    })
    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Brian',
      spaces: [{ name: 'team A', id: 'team.a' }]
    })
    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Carol',
      spaces: [{ name: 'team B', id: 'team.b' }]
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'admin-settings' })
    await ui.userNavigatesToProjectSpaceManagementPage({ world, stepUser: 'Alice' })
    await ui.userChangesSpaceQuotaUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b'],
      value: '50'
    })
    await ui.userDisablesSpacesUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.userEnablesSpacesUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.userDisablesSpacesUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.userDeletesSpacesUsingBatchActions({
      world,
      stepUser: 'Alice',
      spaceIds: ['team.a', 'team.b']
    })
    await ui.userShouldNotSeeSpaces({
      world,
      stepUser: 'Alice',
      expectedSpaceIds: ['team.a', 'team.b']
    })
  })
})
