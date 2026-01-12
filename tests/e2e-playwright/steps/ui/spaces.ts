import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { objects } from '../../../e2e/support'
import { Space } from '../../../e2e/support/types'
import { Locator } from '@playwright/test'
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

export async function getSpaceLocator({
  actorsEnvironment,
  stepUser,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionType: string
  space?: string
}): Promise<Locator> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  return await spacesObject.getSpaceLocator(space)
}

export async function changeRoles({
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
export async function removeAccessToMember({
  actorsEnvironment,
  usersEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spacesObject = new objects.applicationFiles.Spaces({ page })
  await spacesObject.removeAccessToMember({
    users: [
      {
        collaborator: usersEnvironment.getUser({ key: stepUser })
      }
    ],
    removeOwnSpaceAccess: true
  })
}
