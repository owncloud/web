import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import { World } from '../../support/world'

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

  await usersObject.allowLogin({ key, action: 'context-menu' })
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

  await usersObject.forbidLogin({ key, action: 'context-menu' })
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

  await usersObject.changeQuota({ key, value, action: 'context-menu' })
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

export async function userAddsUsersToGroupsUsingBatchActions({
  world,
  stepUser,
  groups,
  users
}: {
  world: World
  stepUser: string
  groups: string[]
  users: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const userIds = []

  for (const user of users) {
    userIds.push(usersObject.getUUID({ key: user }))
    await usersObject.select({ key: user })
  }

  await usersObject.addToGroupsBatchAction({ userIds, groups })
}

export async function removeUsersFromGroupsUsingBatchActions({
  world,
  stepUser,
  groups,
  users
}: {
  world: World
  stepUser: string
  groups: string[]
  users: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const userIds = []

  for (const user of users) {
    userIds.push(usersObject.getUUID({ key: user }))
    await usersObject.select({ key: user })
  }

  await usersObject.removeFromGroupsBatchAtion({ userIds, groups })
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
  await usersObject.changeUser({ key, attribute: 'userName', value, action: 'context-menu' })
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
  await usersObject.changeUser({ key: user, attribute, value, action: 'context-menu' })
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
  await usersObject.openEditPanel({ key: actionUser, action: 'quick-action' })
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
  await usersObject.openEditPanel({ key: actionUser, action: 'context-menu' })
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
    action: 'context-menu'
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
    action: 'context-menu'
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

export async function userShouldSeeGroupIds({
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
    expect(actualGroupsIds).toContain(groupsObject.getUUID({ key: group }))
  }
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
  actionType: string
  groupsToBeDeleted: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const groupIds = []
  switch (actionType) {
    case 'batch actions':
      for (const group of groupsToBeDeleted) {
        groupIds.push(groupsObject.getUUID({ key: group }))
        await groupsObject.selectGroup({ key: group })
      }
      await groupsObject.deleteGroupUsingBatchAction({ groupIds })
      break
    case 'context menu':
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
  action: string
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
