import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { objects } from '../../../e2e/support'
import { Space } from '../../../e2e/support/types'
import {
  getDynamicRoleIdByName,
  ResourceType,
  shareRoles
} from '../../../e2e/support/api/share/share'
import { expect } from '@playwright/test'

export async function navigateToPersonalSpacePage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.spaces.Personal({ page })
  await pageObject.navigate()
}

export async function navigateToSpacesPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
  await pageObject.navigate()
}

export async function navigateToSpace({
  actorsEnvironment,
  stepUser,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  space: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
  await pageObject.navigate()
  await spacesObject.open({ key: space })
}

export async function userCreatesProjectSpaces({
  actorsEnvironment,
  stepUser,
  spaces
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaces: Array<{ name: string; id: string }>
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  for (const space of spaces) {
    await spacesObject.create({
      key: space.id || space.name,
      space: { name: space.name, id: space.id } as unknown as Space
    })
  }
}
export async function userAddsMembersToSpace({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  members
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  members: { user: string; role: string; kind: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const sharer = usersEnvironment.getUser({ key: stepUser })

  for (const sharee of members) {
    const collaborator =
      sharee.kind === 'user'
        ? usersEnvironment.getUser({ key: sharee.user })
        : usersEnvironment.getGroup({ key: sharee.user })
    const roleId = await getDynamicRoleIdByName(sharer, sharee.role, 'space' as ResourceType)
    const collaboratorWithRole = {
      collaborator,
      role: roleId
    }
    await spacesObject.addMembers({ users: [collaboratorWithRole] })
  }
}

export async function addExpirationDate({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  memberName,
  expirationDate
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  memberName: string
  expirationDate: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const member = { collaborator: usersEnvironment.getUser({ key: memberName }) }
  await spacesObject.addExpirationDate({ member, expirationDate })
}

export async function removeExpirationDate({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  memberName
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  memberName: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const member = { collaborator: usersEnvironment.getUser({ key: memberName }) }
  await spacesObject.removeExpirationDate({ member })
}

export async function removeAccessToMember({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  reciver,
  role
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  reciver: string
  role: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const member = {
    collaborator: usersEnvironment.getUser({ key: reciver }),
    role
  }
  await spacesObject.removeAccessToMember({ users: [member] })
}

export async function userNavigatesToProjectSpaceManagementPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.Spaces({ page })
  await pageObject.navigate()
}

export async function manageSpaceUsingContexMenu({
  actorsEnvironment,
  stepUser,
  action,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  action: string
  space: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceId = spacesObject.getUUID({ key: space })
  switch (action) {
    case 'disables':
      await spacesObject.disable({ spaceIds: [spaceId], context: 'context-menu' })
      break
    case 'deletes':
      await spacesObject.delete({ spaceIds: [spaceId], context: 'context-menu' })
      break
    case 'enables':
      await spacesObject.enable({ spaceIds: [spaceId], context: 'context-menu' })
      break
    default:
      throw new Error(`${action} not implemented`)
  }
}

export async function userDownloadsSpace({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const downloadedResource = await spacesObject.downloadSpace()
  expect(downloadedResource).toContain('download.zip')
}

export async function navigateToTrashbin({
  actorsEnvironment,
  stepUser,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  space?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.trashbin.Overview({ page })
  await pageObject.navigate()
  if (space) {
    const trashbinObject = new objects.applicationFiles.Trashbin({ page })
    await trashbinObject.open(space)
  }
}

export async function userShouldNotSeeSpace({
  actorsEnvironment,
  stepUser,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  space?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const spaceLocator = await spacesObject.getSpaceLocator(space)
  await expect(spaceLocator).not.toBeVisible()
}

export async function userChangesMemberRole({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  role,
  sharee
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  role: string
  sharee: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const sharer = usersEnvironment.getUser({ key: stepUser })

  const roleId = await getDynamicRoleIdByName(sharer, role, 'space' as ResourceType)
  const member = {
    collaborator: usersEnvironment.getUser({ key: sharee }),
    role: roleId
  }
  await spacesObject.changeRoles({ users: [member] })
}

export async function userShouldSeeSpaces({
  actorsEnvironment,
  stepUser,
  expectedSpaceIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedSpaceIds: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const actualList = await spacesObject.getDisplayedSpaces()
  for (const expectedSpaceId of expectedSpaceIds) {
    const space = spacesObject.getSpace({ key: expectedSpaceId })
    expect(actualList).toContain(space.id)
  }
}

export async function userShouldNotSeeSpaces({
  actorsEnvironment,
  stepUser,
  expectedSpaceIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedSpaceIds: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const actualList = await spacesObject.getDisplayedSpaces()
  for (const expectedSpaceId of expectedSpaceIds) {
    const space = spacesObject.getSpace({ key: expectedSpaceId })
    expect(actualList).not.toContain(space.id)
  }
}

export async function userDisablesSpaceUsingContextMenu({
  actorsEnvironment,
  stepUser,
  spaceId
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaceId: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceUUID = spacesObject.getUUID({ key: spaceId })
  await spacesObject.disable({ spaceIds: [spaceUUID], context: 'context-menu' })
}

export async function userEnablesSpaceUsingContextMenu({
  actorsEnvironment,
  stepUser,
  spaceId
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaceId: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceUUID = spacesObject.getUUID({ key: spaceId })
  await spacesObject.enable({ spaceIds: [spaceUUID], context: 'context-menu' })
}

export async function userDeletesSpaceUsingContextMenu({
  actorsEnvironment,
  stepUser,
  spaceId
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaceId: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceUUID = spacesObject.getUUID({ key: spaceId })
  await spacesObject.delete({ spaceIds: [spaceUUID], context: 'context-menu' })
}

export async function userDisablesSpacesUsingBatchActions({
  actorsEnvironment,
  stepUser,
  spaceIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaceIds: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const uuids = spaceIds.map((id) => spacesObject.getUUID({ key: id }))
  for (const id of spaceIds) {
    await spacesObject.select({ key: id })
  }
  await spacesObject.disable({ spaceIds: uuids, context: 'batch-actions' })
}

export async function userEnablesSpacesUsingBatchActions({
  actorsEnvironment,
  stepUser,
  spaceIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaceIds: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const uuids = spaceIds.map((id) => spacesObject.getUUID({ key: id }))
  for (const id of spaceIds) {
    await spacesObject.select({ key: id })
  }
  await spacesObject.enable({ spaceIds: uuids, context: 'batch-actions' })
}

export async function userDeletesSpacesUsingBatchActions({
  actorsEnvironment,
  stepUser,
  spaceIds
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaceIds: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const uuids = spaceIds.map((id) => spacesObject.getUUID({ key: id }))
  for (const id of spaceIds) {
    await spacesObject.select({ key: id })
  }
  await spacesObject.delete({ spaceIds: uuids, context: 'batch-actions' })
}

export async function userUpdatesSpaceUsingContextMenu({
  actorsEnvironment,
  stepUser,
  spaceId,
  updates
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaceId: string
  updates: Array<{ attribute: 'name' | 'subtitle' | 'quota'; value: string }>
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceUUID = spacesObject.getUUID({ key: spaceId })

  for (const update of updates) {
    switch (update.attribute) {
      case 'name':
        await spacesObject.renameSpaceUsingContextMenu({ key: spaceId, value: update.value })
        break
      case 'subtitle':
        await spacesObject.changeSubtitleUsingContextMenu({ key: spaceId, value: update.value })
        break
      case 'quota':
        await spacesObject.changeQuota({
          spaceIds: [spaceUUID],
          value: update.value,
          context: 'context-menu'
        })
        break
      default:
        throw new Error(`'${update.attribute}' not implemented`)
    }
  }
}

export async function userChangesSpaceQuotaUsingBatchActions({
  actorsEnvironment,
  stepUser,
  spaceIds,
  value
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  spaceIds: string[]
  value: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const uuids = []
  for (const spaceId of spaceIds) {
    uuids.push(spacesObject.getUUID({ key: spaceId }))
    await spacesObject.select({ key: spaceId })
  }
  await spacesObject.changeQuota({
    spaceIds: uuids,
    value,
    context: 'batch-actions'
  })
}

export async function listMembersOfProjectSpaceUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  space: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  await spacesObject.openPanel({ key: space })
  await spacesObject.openActionSideBarPanel({ action: 'SpaceMembers' })
}
export async function shouldSeeUsersInSidebarPanelOfSpacesAdminSettings({
  actorsEnvironment,
  stepUser,
  expectedMembers
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedMembers: Array<{ user: string; role: string }>
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const actualMemberList = {
    manager: await spacesObject.listMembers({ filter: 'Can manage' }),
    viewer: await spacesObject.listMembers({ filter: 'Can view' }),
    editor: await spacesObject.listMembers({ filter: 'Can edit with versions and trashbin' })
  }
  for (const member of expectedMembers) {
    const shareRole = shareRoles[member.role as keyof typeof shareRoles]
    expect(actualMemberList[shareRole as keyof typeof actualMemberList]).toContain(member.user)
  }
}
