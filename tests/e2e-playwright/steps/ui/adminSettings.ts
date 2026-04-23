import { objects } from '../../../e2e/support'
import { World } from '../../support/world'
import { expect } from '@playwright/test'

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

export async function userChangesUserQuota({
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
