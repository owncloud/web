import { test, expect } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('groups management', () => {
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
    const admin = usersEnvironment.getUser({ key: 'Admin' })
    await api.cleanUpGroup(admin)
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Admin' })
  })

  test('admin creates group', async () => {
    await ui.openApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.navigateToGroupsManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.createGroups({
      actorsEnvironment,
      stepUser: 'Admin',
      groupIds: ['sales', 'security']
    })
    expect(
      await ui.checkGroupsPresenceById({
        actorsEnvironment,
        stepUser: 'Admin',
        expectedGroupIds: ['sales', 'security']
      })
    ).toBeTruthy()
  })

  test('admin deletes group', async () => {
    await api.createGroups({
      groupIds: ['sales', 'security', 'finance'],
      admin: usersEnvironment.getUser({ key: 'Admin' })
    })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.navigateToGroupsManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.deleteGroups({
      actorsEnvironment,
      stepUser: 'Admin',
      actionType: 'context menu',
      groupsToBeDeleted: ['sales']
    })

    expect(
      await ui.checkGroupsPresenceById({
        actorsEnvironment,
        stepUser: 'Admin',
        expectedGroupIds: ['sales']
      })
    ).toBeFalsy()

    await ui.deleteGroups({
      actorsEnvironment,
      stepUser: 'Admin',
      actionType: 'batch actions',
      groupsToBeDeleted: ['security', 'finance']
    })

    expect(
      await ui.checkGroupsPresenceById({
        actorsEnvironment,
        stepUser: 'Admin',
        expectedGroupIds: ['security', 'finance']
      })
    ).toBeFalsy()
  })

  test('edit groups', async () => {
    await api.createGroups({
      groupIds: ['sales'],
      admin: usersEnvironment.getUser({ key: 'Admin' })
    })
    await ui.openApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.navigateToGroupsManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.changeGroup({
      actorsEnvironment,
      stepUser: 'Admin',
      key: 'sales',
      attribute: 'displayName',
      value: 'a renamed group',
      action: 'context-menu'
    })
    expect(
      await ui.groupDisplayNameExists({
        actorsEnvironment,
        stepUser: 'Admin',
        groupDisplayName: 'a renamed group'
      })
    ).toBeTruthy()
  })
})
