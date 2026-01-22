import { objects } from '../../../e2e/support'
import { ActorsEnvironment, FilesEnvironment } from '../../../e2e/support/environment'

export async function navigateToGeneralManagementPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.General({ page })
  await pageObject.navigate()
}

export async function uploadLogoFromLocalPath({
  actorsEnvironment,
  stepUser,
  localFile,
  filesEnvironment
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  localFile: string
  filesEnvironment: FilesEnvironment
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const generalObject = new objects.applicationAdminSettings.General({ page })
  const logoPath = filesEnvironment.getFile({ name: localFile.split('/').pop() }).path
  await generalObject.uploadLogo({ path: logoPath })
}

export async function resetLogo({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const generalObject = new objects.applicationAdminSettings.General({ page })
  await generalObject.resetLogo()
}

export async function navigateToUsersManagementPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.Users({ page })
  await pageObject.navigate()
}

export async function allowUserLogin({
  actorsEnvironment,
  stepUser,
  key
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  await usersObject.allowLogin({ key, action: 'context-menu' })
}

export async function forbidUserLogin({
  actorsEnvironment,
  stepUser,
  key
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  await usersObject.forbidLogin({ key, action: 'context-menu' })
}

export async function changeUserQuota({
  actorsEnvironment,
  stepUser,
  key,
  value
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  await usersObject.changeQuota({ key, value, action: 'context-menu' })
}

export async function addUsersToGroupsUsingBatchActions({
  actorsEnvironment,
  stepUser,
  groups,
  users
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  groups: string[]
  users: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const userIds = []

  for (const user of users) {
    userIds.push(usersObject.getUUID({ key: user }))
    await usersObject.select({ key: user })
  }

  await usersObject.addToGroupsBatchAtion({ userIds, groups })
}

export async function removeUsersFromGroupsUsingBatchActions({
  actorsEnvironment,
  stepUser,
  groups,
  users
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  groups: string[]
  users: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const userIds = []

  for (const user of users) {
    userIds.push(usersObject.getUUID({ key: user }))
    await usersObject.select({ key: user })
  }

  await usersObject.removeFromGroupsBatchAtion({ userIds, groups })
}

export async function setFilters({
  actorsEnvironment,
  stepUser,
  filters
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  filters: { filter: string; values: string[] }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  for (const { filter, values } of filters) {
    await usersObject.filter({ filter, values })
  }
}

export async function usersShouldBeVisible({
  actorsEnvironment,
  stepUser,
  expectedUsers
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedUsers: string[]
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const displayedUsers = await usersObject.getDisplayedUsers()

  for (const user of expectedUsers) {
    const userId = usersObject.getUUID({ key: user })
    if (!displayedUsers.includes(userId)) return false
  }

  return true
}

export async function changeUserNameUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  key,
  value
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.changeUser({ key, attribute: 'userName', value, action: 'context-menu' })
}

export async function changeUserDisplayNameUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  key,
  value
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.changeUser({ key, attribute: 'displayName', value, action: 'context-menu' })
}

export async function changeUserEmailUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  key,
  value
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.changeUser({ key, attribute: 'email', value, action: 'context-menu' })
}

export async function changeUserPasswordUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  key,
  value
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.changeUser({ key, attribute: 'password', value, action: 'context-menu' })
}

export async function changeUserRoleUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  key,
  value
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.changeUser({ key, attribute: 'role', value, action: 'context-menu' })
}

export async function deleteUsersUsingBatchActions({
  actorsEnvironment,
  stepUser,
  users
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  users: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  const userIds = []

  for (const user of users) {
    userIds.push(usersObject.getUUID({ key: user }))
    await usersObject.select({ key: user })
  }

  await usersObject.deleteUserUsingBatchAction({ userIds })
}

export async function deleteUsersUsingContextMenu({
  actorsEnvironment,
  stepUser,
  users
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  users: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  for (const user of users) {
    await usersObject.deleteUserUsingContextMenu({ key: user })
  }
}

export async function userShouldHaveInfo({
  actorsEnvironment,
  stepUser,
  info
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  info: { key: string; value: string }[]
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })

  for (const { key, value } of info) {
    const actual = await accountObject.getUserInfo(key)
    if (actual !== value) return false
  }

  return true
}

export async function createUser({
  actorsEnvironment,
  stepUser,
  userData
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  userData: { name: string; displayname: string; email: string; password: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
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

export async function openEditPanelOfUserUsingQuickAction({
  actorsEnvironment,
  stepUser,
  actionUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.openEditPanel({ key: actionUser, action: 'quick-action' })
}

export async function openEditPanelOfUserUsingContextMenu({
  actorsEnvironment,
  stepUser,
  actionUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.openEditPanel({ key: actionUser, action: 'context-menu' })
}

export async function userShouldSeeEditPanel({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  try {
    await usersObject.waitForEditPanelToBeVisible()
    return true
  } catch {
    return false
  }
}

export async function addUserToGroupsUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  user,
  groups
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  user: string
  groups: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.addToGroups({
    key: user,
    groups,
    action: 'context-menu'
  })
}

export async function removeUserToGroupsUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  user,
  groups
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  user: string
  groups: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.removeFromGroups({
    key: user,
    groups,
    action: 'context-menu'
  })
}

export async function userNavigatesToGroupsManagementPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.page.Groups({ page })
  await groupsObject.navigate()
}

export async function userCreatesGroups({
  actorsEnvironment,
  stepUser,
  groupIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  groupIds: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  for (const groupId of groupIds) {
    await groupsObject.createGroup({ key: groupId })
  }
}

export async function checkGroupsPresenceById({
  actorsEnvironment,
  stepUser,
  expectedGroupIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedGroupIds: string[]
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const actualGroupsIds = await groupsObject.getDisplayedGroupsIds()
  for (const group of expectedGroupIds) {
    if (!actualGroupsIds.includes(groupsObject.getUUID({ key: group }))) {
      return false
    }
  }
  return true
}

export async function groupDisplayNameExists({
  actorsEnvironment,
  stepUser,
  groupDisplayName
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  groupDisplayName: string
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const groups = await groupsObject.getGroupsDisplayName()
  return groups.includes(groupDisplayName)
}

export async function userDeletesGroups({
  actorsEnvironment,
  stepUser,
  actionType,
  groupsToBeDeleted
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionType: string
  groupsToBeDeleted: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
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
  actorsEnvironment,
  stepUser,
  key,
  attribute,
  value,
  action
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  attribute: string
  value: string
  action: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  await groupsObject.changeGroup({
    key,
    attribute: attribute,
    value,
    action
  })
}

export async function userNavigatesToUserManagementPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.Users({ page })
  await pageObject.navigate()
}

export async function userChangesUserQuota({
  actorsEnvironment,
  stepUser,
  key,
  value
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  key: string
  value: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })
  await usersObject.changeQuota({ key, value, action: 'context-menu' })
}
