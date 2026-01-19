import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import { World } from '../../support/world'
import { fileAction } from '../../support/constants'

export async function userNavigatesToGeneralManagementPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.General({ page })
  await pageObject.navigate()
}

export async function userUploadsLogoFromLocalPath({
  world,
  stepUser,
  localFile
}: {
  world: World
  stepUser: string
  localFile: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const generalObject = new objects.applicationAdminSettings.General({ page })
  const logoPath = world.filesEnvironment.getFile({ name: localFile.split('/').pop() }).path
  await generalObject.uploadLogo({ path: logoPath })
}

export async function userResetsLogo({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const generalObject = new objects.applicationAdminSettings.General({ page })
  await generalObject.resetLogo()
}

export async function userAllowsLoginForUserUsingContextMenu({
  world,
  stepUser,
  key
}: {
  world: World
  stepUser: string
  key: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  await usersObject.allowLogin({ key, action: fileAction.contextMenu })
}

export async function userForbidsLoginForUserUsingContextMenu({
  world,
  stepUser,
  key
}: {
  world: World
  stepUser: string
  key: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  await usersObject.forbidLogin({ key, action: fileAction.contextMenu })
}

export async function userChangesQuotaOfUserUsingContextMenu({
  world,
  stepUser,
  key,
  value
}: {
  world: World
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  await usersObject.changeQuota({ key, value, action: fileAction.contextMenu })
}

export async function userChangesQuotaOfUserUsingSidebarPanel({
  world,
  stepUser,
  key,
  value
}: {
  world: World
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  await usersObject.changeQuota({ key, value, action: fileAction.quickAction })
}

export async function userChangesQuotaForUsersUsingBatchAction({
  world,
  stepUser,
  value,
  users
}: {
  world: World
  stepUser: string
  value: string
  users: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  for (const user of users) {
    await usersObject.selectUser({ key: user })
  }
  await usersObject.changeQuotaUsingBatchAction({ value, users })
}

async function selectUsersAndGetIds({
  usersObject,
  userKeys
}: {
  usersObject: InstanceType<typeof objects.applicationAdminSettings.Users>
  userKeys: string[]
}): Promise<string[]> {
  const selectedUserIds: string[] = []

  for (const userKey of userKeys) {
    selectedUserIds.push(usersObject.getUUID({ key: userKey }))
    await usersObject.select({ key: userKey })
  }

  return selectedUserIds
}

export async function userAddsUsersToGroupsUsingBatchActions({
  world,
  stepUser,
  assignments
}: {
  world: World
  stepUser: string
  assignments: Array<{ group: string; users: string[] }>
}): Promise<void> {
  if (assignments.length === 0) {
    return
  }

  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  for (const { group, users } of assignments) {
    const selectedUserIds = await selectUsersAndGetIds({
      usersObject,
      userKeys: users
    })

    await usersObject.addToGroupsBatchAction({
      userIds: selectedUserIds,
      groups: [group]
    })
  }
}

export async function userRemovesUsersFromGroupsUsingBatchActions({
  world,
  stepUser,
  assignments
}: {
  world: World
  stepUser: string
  assignments: Array<{ user: string; groups: string[] }>
}): Promise<void> {
  if (assignments.length === 0) {
    return
  }

  const users = assignments.map(({ user }) => user)
  const groups = assignments[0].groups
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const selectedUserIds = await selectUsersAndGetIds({
    usersObject,
    userKeys: users
  })

  await usersObject.removeFromGroupsBatchAtion({
    userIds: selectedUserIds,
    groups
  })
}

export async function userSetsFilters({
  world,
  stepUser,
  filters
}: {
  world: World
  stepUser: string
  filters: { filter: string; values: string[] }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  for (const { filter, values } of filters) {
    await usersObject.filter({ filter, values })
  }
}

export async function usersShouldBeVisible({
  world,
  stepUser,
  expectedUsers
}: {
  world: World
  stepUser: string
  expectedUsers: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const displayedUsers = await usersObject.getDisplayedUsers()

  for (const user of expectedUsers) {
    const userId = usersObject.getUUID({ key: user })
    expect(displayedUsers).toContain(userId)
  }
}

export async function usersShouldNotBeVisible({
  world,
  stepUser,
  expectedUsers
}: {
  world: World
  stepUser: string
  expectedUsers: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const displayedUsers = await usersObject.getDisplayedUsers()

  for (const user of expectedUsers) {
    const userId = usersObject.getUUID({ key: user })
    expect(displayedUsers).not.toContain(userId)
  }
}

export async function userChangesNameOfUserUsingContextMenu({
  world,
  stepUser,
  key,
  value
}: {
  world: World
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.changeUser({
    key,
    attribute: 'userName',
    value,
    action: fileAction.contextMenu
  })
}

export async function userUpdatesUserAttributeUsingContextMenu({
  world,
  stepUser,
  user,
  attribute,
  value
}: {
  world: World
  stepUser: string
  user: string
  attribute: string
  value: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.changeUser({ key: user, attribute, value, action: fileAction.contextMenu })
}

export async function userDeletesUsersUsingBatchActions({
  world,
  stepUser,
  users
}: {
  world: World
  stepUser: string
  users: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const userIds = []

  for (const user of users) {
    userIds.push(usersObject.getUUID({ key: user }))
    await usersObject.select({ key: user })
  }

  await usersObject.deleteUserUsingBatchAction({ userIds })
}

export async function userDeletesUsersUsingContextMenu({
  world,
  stepUser,
  users
}: {
  world: World
  stepUser: string
  users: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  for (const user of users) {
    await usersObject.deleteUserUsingContextMenu({ key: user })
  }
}

export async function userShouldHaveSelfInfo({
  world,
  stepUser,
  info
}: {
  world: World
  stepUser: string
  info: { key: string; value: string }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })

  for (const { key, value } of info) {
    const actual = await accountObject.getUserInfo(key)
    expect(actual).toBe(value)
  }
}

export async function userCreatesUser({
  world,
  stepUser,
  userData
}: {
  world: World
  stepUser: string
  userData: { name: string; displayname: string; email: string; password: string }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  for (const info of userData) {
    await usersObject.createUser({
      name: info.name,
      displayname: info.displayname,
      email: info.email,
      password: info.password
    })
  }
}

export async function userOpensEditPanelOfUserUsingQuickAction({
  world,
  stepUser,
  actionUser
}: {
  world: World
  stepUser: string
  actionUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.openEditPanel({ key: actionUser, action: fileAction.quickAction })
}

export async function userOpensEditPanelOfUserUsingContextMenu({
  world,
  stepUser,
  actionUser
}: {
  world: World
  stepUser: string
  actionUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.openEditPanel({ key: actionUser, action: fileAction.contextMenu })
}

export async function userShouldSeeEditPanel({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.waitForEditPanelToBeVisible()
}

export async function userAddsUserToGroupsUsingContextMenu({
  world,
  stepUser,
  user,
  groups
}: {
  world: World
  stepUser: string
  user: string
  groups: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.addToGroups({
    key: user,
    groups,
    action: fileAction.contextMenu
  })
}

export async function userRemovesUserFromGroupsUsingContextMenu({
  world,
  stepUser,
  user,
  groups
}: {
  world: World
  stepUser: string
  user: string
  groups: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.removeFromGroups({
    key: user,
    groups,
    action: fileAction.contextMenu
  })
}

export async function userNavigatesToGroupsManagementPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.page.Groups({ page })
  await groupsObject.navigate()
}

export async function userNavigatesToUsersManagementPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.Users({ page })
  await pageObject.navigate()
}

export async function userCreatesGroups({
  world,
  stepUser,
  groupIds
}: {
  world: World
  stepUser: string
  groupIds: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  for (const groupId of groupIds) {
    await groupsObject.createGroup({ key: groupId })
  }
}

export async function checkGroupsPresenceById({
  world,
  stepUser,
  expectedGroupIds
}: {
  world: World
  stepUser: string
  expectedGroupIds: string[]
}): Promise<boolean> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const actualGroupsIds = await groupsObject.getDisplayedGroupsIds()
  for (const group of expectedGroupIds) {
    if (!actualGroupsIds.includes(groupsObject.getUUID({ key: group }))) {
      return false
    }
  }
  return true
}

export async function userShouldNotSeeGroupIds({
  world,
  stepUser,
  expectedGroupIds
}: {
  world: World
  stepUser: string
  expectedGroupIds: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const actualGroupsIds = await groupsObject.getDisplayedGroupsIds()
  for (const group of expectedGroupIds) {
    expect(actualGroupsIds).not.toContain(groupsObject.getUUID({ key: group }))
  }
}

export async function userShouldSeeGroupDisplayName({
  world,
  stepUser,
  groupDisplayName
}: {
  world: World
  stepUser: string
  groupDisplayName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const groups = await groupsObject.getGroupsDisplayName()
  expect(groups).toContain(groupDisplayName)
}

export async function userDeletesGroups({
  world,
  stepUser,
  actionType,
  groupsToBeDeleted
}: {
  world: World
  stepUser: string
  actionType: typeof fileAction.batchAction | typeof fileAction.contextMenu
  groupsToBeDeleted: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const groupIds = []
  switch (actionType) {
    case fileAction.batchAction:
      for (const group of groupsToBeDeleted) {
        groupIds.push(groupsObject.getUUID({ key: group }))
        await groupsObject.selectGroup({ key: group })
      }
      await groupsObject.deleteGroupUsingBatchAction({ groupIds })
      break
    case fileAction.contextMenu:
      for (const group of groupsToBeDeleted) {
        await groupsObject.deleteGroupUsingContextMenu({ key: group })
      }
      break
    default:
      throw new Error(`'${actionType}' not implemented`)
  }
}

export async function userChangesGroup({
  world,
  stepUser,
  key,
  attribute,
  value,
  action
}: {
  world: World
  stepUser: string
  key: string
  attribute: string
  value: string
  action: typeof fileAction.contextMenu | typeof fileAction.quickAction
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  await groupsObject.changeGroup({
    key,
    attribute: attribute,
    value,
    action
  })
}

export async function userNavigatesToUserManagementPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.Users({ page })
  await pageObject.navigate()
}

export async function userAuthenticatesWithOTP({
  world,
  stepUser,
  deviceName
}: {
  world: World
  stepUser: string
  deviceName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const generalObject = new objects.applicationAdminSettings.General({ page })
  await generalObject.userAuthenticatesWithOTP({ deviceName })
}

export async function userDeletesGroup({
  world,
  stepUser,
  actionType,
  group
}: {
  world: World
  stepUser: string
  actionType: 'batch actions' | 'context menu'
  group: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const groupIds = []

  switch (actionType) {
    case 'batch actions':
      groupIds.push(groupsObject.getUUID({ key: group }))
      await groupsObject.selectGroup({ key: group })
      await groupsObject.deleteGroupUsingBatchAction({ groupIds })
      break
    case 'context menu':
      await groupsObject.deleteGroupUsingContextMenu({ key: group })
      break
    default:
      throw new Error(`'${actionType}' not implemented`)
  }
}

export async function userRenamesGroup({
  world,
  stepUser,
  attribute,
  value,
  user
}: {
  world: World
  stepUser: string
  attribute: string
  value: string
  user: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })

  await groupsObject.changeGroup({
    key: user,
    attribute: attribute,
    value: value,
    action: 'context-menu'
  })
}

export async function userAddsUserToGroup({
  world,
  stepUser,
  action,
  groups,
  user
}: {
  world: World
  stepUser: string
  action: string
  groups: string[]
  user: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  switch (action) {
    case 'adds':
      await usersObject.addToGroups({
        key: user,
        groups,
        action: 'context-menu'
      })
      break
    case 'removes':
      await usersObject.removeFromGroups({
        key: user,
        groups,
        action: 'context-menu'
      })
      break
    default:
      throw new Error(`'${action}' not implemented`)
  }
}
