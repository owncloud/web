import { test } from '../../environment/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'
import { fileAction } from '../../environment/constants'

test.describe('groups management', () => {
  test.beforeEach(async ({ world }) => {
    await ui.userLogsIn({ world, stepUser: 'Admin' })
  })

  test.afterEach(async ({ world }) => {
    await ui.userLogsOut({ world, stepUser: 'Admin' })
  })

  test('admin creates group', async ({ world }) => {
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToGroupsManagementPage({ world, stepUser: 'Admin' })
    await ui.userCreatesGroups({
      world,
      stepUser: 'Admin',
      groupIds: ['sales', 'security']
    })
    await ui.userShouldSeeGroupIds({
      world,
      stepUser: 'Admin',
      expectedGroupIds: ['sales', 'security']
    })
  })

  test('admin deletes group', async ({ world }) => {
    await api.groupsHaveBeenCreated({
      world,
      groupIds: ['sales', 'security', 'finance'],
      stepUser: 'Admin'
    })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToGroupsManagementPage({ world, stepUser: 'Admin' })
    await ui.userDeletesGroups({
      world,
      stepUser: 'Admin',
      actionType: fileAction.contextMenu,
      groupsToBeDeleted: ['sales']
    })

    await ui.userShouldNotSeeGroupIds({
      world,
      stepUser: 'Admin',
      expectedGroupIds: ['sales']
    })

    await ui.userDeletesGroups({
      world,
      stepUser: 'Admin',
      actionType: fileAction.batchAction,
      groupsToBeDeleted: ['security', 'finance']
    })

    await ui.userShouldNotSeeGroupIds({
      world,
      stepUser: 'Admin',
      expectedGroupIds: ['security', 'finance']
    })
  })

  test('edit groups', async ({ world }) => {
    await api.groupsHaveBeenCreated({
      world,
      groupIds: ['sales'],
      stepUser: 'Admin'
    })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToGroupsManagementPage({ world, stepUser: 'Admin' })
    await ui.userChangesGroup({
      world,
      stepUser: 'Admin',
      key: 'sales',
      attribute: 'displayName',
      value: 'a renamed group',
      action: fileAction.contextMenu
    })
    await ui.userShouldSeeGroupDisplayName({
      world,
      stepUser: 'Admin',
      groupDisplayName: 'a renamed group'
    })
  })
})
