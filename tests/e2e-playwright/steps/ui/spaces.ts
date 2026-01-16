import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { objects } from '../../../e2e/support'
import { Space } from '../../../e2e/support/types'
import { getDynamicRoleIdByName, ResourceType } from '../../../e2e/support/api/share/share'

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

export async function createProjectSpace({
  actorsEnvironment,
  stepUser,
  name,
  id
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  name: string
  id: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  await spacesObject.create({ key: id || name, space: { name: name, id: id } as unknown as Space })
}
export async function addMembersToSpace({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  sharee,
  role,
  kind
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  sharee: string
  role: string
  kind: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const sharer = usersEnvironment.getUser({ key: stepUser })

  const collaborator =
    kind === 'user'
      ? usersEnvironment.getUser({ key: sharee })
      : usersEnvironment.getGroup({ key: sharee })
  const roleId = await getDynamicRoleIdByName(sharer, role, 'space' as ResourceType)
  const collaboratorWithRole = {
    collaborator,
    role: roleId
  }
  await spacesObject.addMembers({ users: [collaboratorWithRole] })
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

export async function navigateToProjectSpaceManagementPage({
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
