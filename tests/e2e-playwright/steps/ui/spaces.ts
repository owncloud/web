import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { objects } from '../../../e2e/support'
import { Space } from '../../../e2e/support/types'
import { World } from '../../../e2e/cucumber/environment'
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
  stepUser,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  world?: World
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
  await pageObject.navigate(world)
}

export async function navigateToSpace({
  actorsEnvironment,
  stepUser,
  space,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  space: string
  world?: World
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
  await pageObject.navigate(world)
  await spacesObject.open({ key: space, world })
}

export async function createProjectSpace({
  actorsEnvironment,
  stepUser,
  name,
  id,
  world
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  name: string
  id: string
  world?: World
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  await spacesObject.create({
    key: id || name,
    space: { name: name, id: id, world } as unknown as Space,
    world
  })
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
