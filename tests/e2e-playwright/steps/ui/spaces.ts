import { objects } from '../../../e2e/support'
import { Space } from '../../../e2e/support/types'
import { getDynamicRoleIdByName, ResourceType } from '../../../e2e/support/api/share/share'
import { expect } from '@playwright/test'
import { substitute } from '../../../e2e/support/utils'
import { World } from '../../support/world'

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

export async function userCreatesProjectSpace({
  world,
  stepUser,
  name,
  id
}: {
  world: World
  stepUser: string
  name: string
  id: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  await spacesObject.create({ key: id || name, space: { name: name, id: id } as unknown as Space })
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
  role: string
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
