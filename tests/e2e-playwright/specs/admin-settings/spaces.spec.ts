import { test, expect } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  SpacesEnvironment,
  UsersEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('spaces management', () => {
  let actorsEnvironment
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
  })

  test.afterEach(async () => {
    // await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    // await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
    // await api.userHasDeletedProjectSpace({
    //   usersEnvironment,
    //   stepUser: 'Admin',
    //   name: 'team A',
    //   id: 'team.a'
    // })
    // await api.userHasDeletedProjectSpace({
    //   usersEnvironment,
    //   stepUser: 'Admin',
    //   name: 'team B',
    //   id: 'team.b'
    // })
  })

  // test('spaces can be created', async () => {
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
  //   await api.userHasAssignRolesToUsers({
  //     usersEnvironment,
  //     stepUser: 'Admin',
  //     targetUserId: 'Alice',
  //     role: 'Space Admin'
  //   })
  //   await api.userHasCreatedProjectSpaces({
  //     usersEnvironment,
  //     spacesEnvironment,
  //     stepUser: 'Alice',
  //     names: ['team A'],
  //     ids: ['team.a']
  //   })
  //   await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  //   await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
  //   await ui.navigateToProjectSpacesManagementPage({ actorsEnvironment, stepUser: 'Alice' })
  //   await ui.createProjectSpaces({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     name: ['team B'],
  //     id: ['team.b']
  //   })
  //   expect(
  //     await ui.shouldSeeSpaces({
  //       actorsEnvironment,
  //       stepUser: 'Alice',
  //       expectedSpaceIds: ['team.a', 'team.b']
  //     })
  //   ).toBeTruthy()
  //   await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  // })

  // test('spaces can be managed in the admin settings via the context menu', async () => {
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
  //   await api.userHasAssignedRolesToUsers({
  //     usersEnvironment,
  //     stepUser: 'Admin',
  //     targetUserId: 'Alice',
  //     role: 'Space Admin'
  //   })
  //   await api.userHasAssignedRolesToUsers({
  //     usersEnvironment,
  //     stepUser: 'Admin',
  //     targetUserId: 'Brian',
  //     role: 'Space Admin'
  //   })
  //   await api.userHasCreatedProjectSpaces({
  //     usersEnvironment,
  //     spacesEnvironment,
  //     stepUser: 'Alice',
  //     names: ['team A', 'team B'],
  //     ids: ['team.a', 'team.b']
  //   })
  //   await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  //   await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
  //   await ui.navigateToProjectSpacesManagementPage({ actorsEnvironment, stepUser: 'Alice' })
  //   await ui.updateSpace({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     key: 'team.a',
  //     attribute: 'name',
  //     value: 'team A updated'
  //   })
  //   await ui.updateSpace({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     key: 'team.b',
  //     attribute: 'subtitle',
  //     value: 'Developer team-subtitle'
  //   })
  //   await ui.updateSpace({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     key: 'team.b',
  //     attribute: 'quota',
  //     value: '50'
  //   })
  //   await ui.disableSpaceUsingContextMenu({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     spaceId: 'team.a'
  //   })
  //   await ui.enableSpaceUsingContextMenu({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     spaceId: 'team.a'
  //   })
  //   expect(
  //     await ui.shouldSeeSpaces({
  //       actorsEnvironment,
  //       stepUser: 'Alice',
  //       expectedSpaceIds: ['team.a', 'team.b']
  //     })
  //   ).toBeTruthy()
  //   await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  //   await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
  //   await ui.openApplication({ actorsEnvironment, stepUser: 'Brian', name: 'admin-settings' })
  //   await ui.navigateToProjectSpacesManagementPage({ actorsEnvironment, stepUser: 'Brian' })
  //   await ui.disableSpaceUsingContextMenu({
  //     actorsEnvironment,
  //     stepUser: 'Brian',
  //     spaceId: 'team.b'
  //   })
  //   await ui.deleteSpaceUsingContextMenu({
  //     actorsEnvironment,
  //     stepUser: 'Brian',
  //     spaceId: 'team.b'
  //   })
  //   expect(
  //     await ui.shouldSeeSpaces({
  //       actorsEnvironment,
  //       stepUser: 'Brian',
  //       expectedSpaceIds: ['team.b']
  //     })
  //   ).toBeFalsy()
  //   await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  // })

  // test('multiple spaces can be managed at once in the admin settings via the batch actions', async () => {
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
  //   await api.userHasAssignedRolesToUsers({
  //     usersEnvironment,
  //     stepUser: 'Admin',
  //     targetUserId: 'Alice',
  //     role: 'Space Admin'
  //   })
  //   await api.userHasCreatedProjectSpaces({
  //     usersEnvironment,
  //     spacesEnvironment,
  //     stepUser: 'Alice',
  //     names: ['team A', 'team B', 'team C', 'team D'],
  //     ids: ['team.a', 'team.b', 'team.c', 'team.d']
  //   })
  //   await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  //   await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
  //   await ui.navigateToProjectSpacesManagementPage({ actorsEnvironment, stepUser: 'Alice' })
  //   await ui.disableSpacesUsingBatchActions({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
  //   })
  //   await ui.enableSpacesUsingBatchActions({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
  //   })
  //   await ui.changeSpaceQuota({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     spaceIds: ['team.a', 'team.b', 'team.c', 'team.d'],
  //     value: '50'
  //   })
  //   await ui.disableSpacesUsingBatchActions({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
  //   })
  //   await ui.deleteSpacesUsingBatchActions({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     spaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
  //   })
  //   expect(
  //     await ui.shouldSeeSpaces({
  //       actorsEnvironment,
  //       stepUser: 'Alice',
  //       expectedSpaceIds: ['team.a', 'team.b', 'team.c', 'team.d']
  //     })
  //   ).toBeFalsy()
  //   await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  // })

  // test('list members via sidebar', async () => {
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'carol' })
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'David' })
  //   await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Edith' })
  //   await api.userHasAssignedRolesToUsers({
  //     usersEnvironment,
  //     stepUser: 'Admin',
  //     users: [{ id: 'Alice', role: 'Space Admin' }]
  //   })
  //   await api.userHasCreatedProjectSpaces({
  //     usersEnvironment,
  //     spacesEnvironment,
  //     stepUser: 'Admin',
  //     names: ['team A'],
  //     ids: ['team.a']
  //   })
  //   await api.addMembersToProjectSpace({
  //     usersEnvironment,
  //     stepUser: 'Admin',
  //     spaceName: 'team A',
  //     members: [
  //       { user: 'Brian', shareType: 'user', role: 'Can edit' },
  //       { user: 'Carol', shareType: 'user', role: 'Can view' },
  //       { user: 'David', shareType: 'user', role: 'Can view' },
  //       { user: 'Edith', shareType: 'user', role: 'Can view' }
  //     ]
  //   })
  //   await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  //   await ui.openApplication({ actorsEnvironment, stepUser: 'Alice', name: 'admin-settings' })
  //   await ui.navigateToProjectSpacesManagementPage({ actorsEnvironment, stepUser: 'Alice' })
  //   await ui.listMembersOfProjectSpaceUsingSidebarPanel({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     space: 'team.a'
  //   })
  //   await ui.shouldSeeUsersInSidebarPanelOfSpacesAdminSettings({
  //     actorsEnvironment,
  //     stepUser: 'Alice',
  //     expectedMembers: [
  //       { user: 'Admin', role: 'Can manage' },
  //       { user: 'Brian', role: 'Can edit' },
  //       { user: 'Carol', role: 'Can view' },
  //       { user: 'David', role: 'Can view' },
  //       { user: 'Edith', role: 'Can view' }
  //     ]
  //   })
  //   await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  // })

  test('admin user can manage the spaces created by other space admin user', async () => {
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
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
    await ui.navigateToProjectSpacesManagementPage({ actorsEnvironment, stepUser: 'Alice' })
    await ui.changeSpaceQuota({
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
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})
