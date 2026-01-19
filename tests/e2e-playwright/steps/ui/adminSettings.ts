import { objects } from '../../../e2e/support'
import { ActorsEnvironment, FilesEnvironment } from '../../../e2e/support/environment'
import { expect } from '@playwright/test'

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

export async function checkGroupsPresenceByName({
  actorsEnvironment,
  stepUser,
  expectedGroupIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedGroupIds: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })
  const actualGroupsIds = await (await groupsObject.getGroupsDisplayName())
    .split(',')
    .map((item) => item.trim())
  expect(actualGroupsIds).toEqual(expect.arrayContaining(expectedGroupIds))
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

export async function userDeletesGroup({
  actorsEnvironment,
  stepUser,
  actionType,
  group
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionType: 'batch actions' | 'context menu'
  group: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
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
  actorsEnvironment,
  stepUser,
  attribute,
  value,
  user
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  attribute: string
  value: string
  user: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const groupsObject = new objects.applicationAdminSettings.Groups({ page })

  await groupsObject.changeGroup({
    key: user,
    attribute: attribute,
    value: value,
    action: 'context-menu'
  })
}

export async function userAddsUserToGroup({
  actorsEnvironment,
  stepUser,
  action,
  groups,
  user
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  action: string
  groups: string[]
  user: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
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
