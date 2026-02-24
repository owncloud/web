import { expect } from '@playwright/test'
import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'
import { actionTypes } from '../../support/constants'

test.describe('groups management', () => {
  let actorsEnvironment

  test.beforeEach(async ({ browser, usersEnvironment }) => {
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

  test('admin creates group', async () => {
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToGroupsManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userCreatesGroups({
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

  test('admin deletes group', async ({ usersEnvironment }) => {
    await api.groupsHaveBeenCreated({
      groupIds: ['sales', 'security', 'finance'],
      admin: usersEnvironment.getUser({ key: 'Admin' })
    })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToGroupsManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userDeletesGroups({
      actorsEnvironment,
      stepUser: 'Admin',
      actionType: actionTypes.contextMenu,
      groupsToBeDeleted: ['sales']
    })

    expect(
      await ui.checkGroupsPresenceById({
        actorsEnvironment,
        stepUser: 'Admin',
        expectedGroupIds: ['sales']
      })
    ).toBeFalsy()

    await ui.userDeletesGroups({
      actorsEnvironment,
      stepUser: 'Admin',
      actionType: actionTypes.batchActions,
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

  test('edit groups', async ({ usersEnvironment }) => {
    await api.groupsHaveBeenCreated({
      groupIds: ['sales'],
      admin: usersEnvironment.getUser({ key: 'Admin' })
    })
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToGroupsManagementPage({ actorsEnvironment, stepUser: 'Admin' })
    await ui.userChangesGroup({
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
