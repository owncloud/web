import { objects } from '../../../e2e/support'
import { Space } from '../../../e2e/support/types'
import {
  getDynamicRoleIdByName,
  ResourceType,
  shareRoles
} from '../../../e2e/support/api/share/share'
import { expect } from '@playwright/test'
import { substitute } from '../../../e2e/support/utils'
import { World } from '../../support/world'
import { actions } from '../../support/constants'

export async function userNavigatesToPersonalSpacePage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.spaces.Personal({ page })
  await pageObject.navigate()
}

export async function userNavigatesToSpacesPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
  await pageObject.navigate()
}

export async function userNavigatesToSpace({
  world,
  stepUser,
  space
}: {
  world: World
  stepUser: string
  space: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
  await pageObject.navigate()
  await spacesObject.open({ key: space })
}

export async function userCreatesProjectSpaces({
  world,
  stepUser,
  spaces
}: {
  world: World
  stepUser: string
  spaces: Array<{ name: string; id: string }>
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  for (const space of spaces) {
    await spacesObject.create({
      key: space.id || space.name,
      space: { name: space.name, id: space.id } as unknown as Space
    })
  }
}
export async function userAddsMembersToSpace({
  world,
  stepUser,
  members
}: {
  world: World
  stepUser: string
  members: { user: string; role: string; kind: string }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const sharer = world.usersEnvironment.getUser({ key: stepUser })

  for (const sharee of members) {
    const collaborator =
      sharee.kind === 'user'
        ? world.usersEnvironment.getUser({ key: sharee.user })
        : world.usersEnvironment.getGroup({ key: sharee.user })
    const roleId = await getDynamicRoleIdByName(sharer, sharee.role, 'space' as ResourceType)
    const collaboratorWithRole = {
      collaborator,
      role: roleId
    }
    await spacesObject.addMembers({ users: [collaboratorWithRole] })
  }
}

export async function userAddsExpirationDate({
  world,
  stepUser,
  memberName,
  expirationDate
}: {
  world: World
  stepUser: string
  memberName: string
  expirationDate: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const member = { collaborator: world.usersEnvironment.getUser({ key: memberName }) }
  await spacesObject.addExpirationDate({ member, expirationDate })
}

export async function userRemovesExpirationDate({
  world,
  stepUser,
  memberName
}: {
  world: World
  stepUser: string
  memberName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const member = { collaborator: world.usersEnvironment.getUser({ key: memberName }) }
  await spacesObject.removeExpirationDate({ member })
}

export async function userRemovesAccessToMember({
  world,
  stepUser,
  reciver,
  role
}: {
  world: World
  stepUser: string
  reciver: string
  role?: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const member = {
    collaborator: world.usersEnvironment.getUser({ key: reciver }),
    role
  }
  await spacesObject.removeAccessToMember({ users: [member] })
}

export async function userNavigatesToProjectSpaceManagementPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationAdminSettings.page.Spaces({ page })
  await pageObject.navigate()
}

export async function userManagesSpaceUsingContexMenu({
  world,
  stepUser,
  action,
  space
}: {
  world: World
  stepUser: string
  action: string
  space: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceId = spacesObject.getUUID({ key: space })
  switch (action) {
    case 'disables':
      await spacesObject.disable({ spaceIds: [spaceId], via: actions.contextMenu })
      break
    case 'deletes':
      await spacesObject.delete({ spaceIds: [spaceId], via: actions.contextMenu })
      break
    case 'enables':
      await spacesObject.enable({ spaceIds: [spaceId], via: actions.contextMenu })
      break
    default:
      throw new Error(`${action} not implemented`)
  }
}

export async function userDownloadsSpace({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const downloadedResource = await spacesObject.downloadSpace()
  expect(downloadedResource).toContain('download.zip')
}

export async function userNavigatesToTrashbin({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.trashbin.Overview({ page })
  await pageObject.navigate()
}

export async function userNavigatesToTrashbinOfSpace({
  world,
  stepUser,
  space
}: {
  world: World
  stepUser: string
  space: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.trashbin.Overview({ page })
  await pageObject.navigate()
  const trashbinObject = new objects.applicationFiles.Trashbin({ page })
  await trashbinObject.open(space)
}

export async function userShouldNotSeeSpace({
  world,
  stepUser,
  space
}: {
  world: World
  stepUser: string
  space?: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const spaceLocator = await spacesObject.getSpaceLocator(space)
  await expect(spaceLocator).not.toBeVisible()
}

export async function userShouldSeeSpace({
  world,
  stepUser,
  space
}: {
  world: World
  stepUser: string
  space?: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const spaceLocator = await spacesObject.getSpaceLocator(space)
  await expect(spaceLocator).toBeVisible()
}

export async function userChangesMemberRole({
  world,
  stepUser,
  role,
  sharee
}: {
  world: World
  stepUser: string
  role: string
  sharee: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const sharer = world.usersEnvironment.getUser({ key: stepUser })

  const roleId = await getDynamicRoleIdByName(sharer, role, 'space' as ResourceType)
  const member = {
    collaborator: world.usersEnvironment.getUser({ key: sharee }),
    role: roleId
  }
  await spacesObject.changeRoles({ users: [member] })
}

export async function userShouldSeeActivitiesOfSpace({
  world,
  stepUser,
  activities
}: {
  world: World
  stepUser: string
  activities: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })

  for (const activity of activities) {
    await spacesObject.checkSpaceActivity({ activity: substitute(activity) })
  }
}

export async function userShouldSeeSpaces({
  world,
  stepUser,
  expectedSpaceIds
}: {
  world: World
  stepUser: string
  expectedSpaceIds: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const actualList = await spacesObject.getDisplayedSpaces()
  for (const expectedSpaceId of expectedSpaceIds) {
    const space = spacesObject.getSpace({ key: expectedSpaceId })
    expect(actualList).toContain(space.id)
  }
}

export async function userShouldNotSeeSpaces({
  world,
  stepUser,
  expectedSpaceIds
}: {
  world: World
  stepUser: string
  expectedSpaceIds: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const actualList = await spacesObject.getDisplayedSpaces()
  for (const expectedSpaceId of expectedSpaceIds) {
    const space = spacesObject.getSpace({ key: expectedSpaceId })
    expect(actualList).not.toContain(space.id)
  }
}

export async function userDisablesSpaceUsingContextMenu({
  world,
  stepUser,
  spaceId
}: {
  world: World
  stepUser: string
  spaceId: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceUUID = spacesObject.getUUID({ key: spaceId })
  await spacesObject.disable({ spaceIds: [spaceUUID], via: actions.contextMenu })
}

export async function userEnablesSpaceUsingContextMenu({
  world,
  stepUser,
  spaceId
}: {
  world: World
  stepUser: string
  spaceId: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceUUID = spacesObject.getUUID({ key: spaceId })
  await spacesObject.enable({ spaceIds: [spaceUUID], via: actions.contextMenu })
}

export async function userDeletesSpaceUsingContextMenu({
  world,
  stepUser,
  spaceId
}: {
  world: World
  stepUser: string
  spaceId: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const spaceUUID = spacesObject.getUUID({ key: spaceId })
  await spacesObject.delete({ spaceIds: [spaceUUID], via: actions.contextMenu })
}

export async function userDisablesSpacesUsingBatchActions({
  world,
  stepUser,
  spaceIds
}: {
  world: World
  stepUser: string
  spaceIds: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const uuids = spaceIds.map((id) => spacesObject.getUUID({ key: id }))
  for (const id of spaceIds) {
    await spacesObject.select({ key: id })
  }
  await spacesObject.disable({ spaceIds: uuids, via: actions.batchAction })
}

export async function userEnablesSpacesUsingBatchActions({
  world,
  stepUser,
  spaceIds
}: {
  world: World
  stepUser: string
  spaceIds: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const uuids = spaceIds.map((id) => spacesObject.getUUID({ key: id }))
  for (const id of spaceIds) {
    await spacesObject.select({ key: id })
  }
  await spacesObject.enable({ spaceIds: uuids, via: actions.batchAction })
}

export async function userDeletesSpacesUsingBatchActions({
  world,
  stepUser,
  spaceIds
}: {
  world: World
  stepUser: string
  spaceIds: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const uuids = spaceIds.map((id) => spacesObject.getUUID({ key: id }))
  for (const id of spaceIds) {
    await spacesObject.select({ key: id })
  }
  await spacesObject.delete({ spaceIds: uuids, via: actions.batchAction })
}

export async function userUpdatesSpaceUsingContextMenu({
  world,
  stepUser,
  spaceId,
  updates
}: {
  world: World
  stepUser: string
  spaceId: string
  updates: Array<{ attribute: 'name' | 'subtitle' | 'quota'; value: string }>
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
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
          via: actions.contextMenu
        })
        break
      default:
        throw new Error(`'${update.attribute}' not implemented`)
    }
  }
}

export async function userChangesSpaceQuotaUsingBatchActions({
  world,
  stepUser,
  spaceIds,
  value
}: {
  world: World
  stepUser: string
  spaceIds: string[]
  value: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const uuids = []
  for (const spaceId of spaceIds) {
    uuids.push(spacesObject.getUUID({ key: spaceId }))
    await spacesObject.select({ key: spaceId })
  }
  await spacesObject.changeQuota({
    spaceIds: uuids,
    value,
    via: actions.batchAction
  })
}

export async function userListsMembersOfProjectSpaceUsingSidebarPanel({
  world,
  stepUser,
  space
}: {
  world: World
  stepUser: string
  space: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  await spacesObject.openPanel({ key: space })
  await spacesObject.openActionSideBarPanel({ action: 'SpaceMembers' })
}
export async function userShouldSeeUsersInSidebarPanelOfSpacesAdminSettings({
  world,
  stepUser,
  expectedMembers
}: {
  world: World
  stepUser: string
  expectedMembers: Array<{ user: string; role: string }>
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
  const actualMemberList = {
    manager: await spacesObject.listMembers({ filter: 'Can manage' }),
    viewer: await spacesObject.listMembers({ filter: 'Can view' }),
    editor: await spacesObject.listMembers({ filter: 'Can edit with versions and trash bin' })
  }
  for (const member of expectedMembers) {
    const shareRole = shareRoles[member.role as keyof typeof shareRoles]
    expect(actualMemberList[shareRole as keyof typeof actualMemberList]).toContain(member.user)
  }
}

export async function userUpdatesSpace({
  world,
  stepUser,
  key,
  updates
}: {
  world: World
  stepUser: string
  key: string
  updates: { attribute: string; value: string }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })

  for (const { attribute, value } of updates) {
    switch (attribute) {
      case 'name':
        await spacesObject.changeName({ key, value })
        break
      case 'subtitle':
        await spacesObject.changeSubtitle({ key, value })
        break
      case 'description':
        await spacesObject.changeDescription({ value })
        break
      case 'quota':
        await spacesObject.changeQuota({ key, value })
        break
      case 'image':
        await spacesObject.changeSpaceImage({
          key,
          resource: world.filesEnvironment.getFile({ name: value })
        })
        break
      default:
        throw new Error(`${attribute} not implemented`)
    }
  }
}
