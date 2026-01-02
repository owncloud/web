import { config } from '../../../e2e/config.js'
import { UsersEnvironment, SpacesEnvironment } from '../../../e2e/support/environment'
import { api } from '../../../e2e/support'
import { ResourceType } from '../../../e2e/support/api/share/share'
import { Space } from '../../../e2e/support/types'

export async function userHasBeenCreated({
  usersEnvironment,
  stepUser,
  userToBeCreated
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  userToBeCreated: string
}): Promise<void> {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const user = usersEnvironment.getUser({ key: userToBeCreated })
  // do not try to create users when using predefined users
  if (!config.predefinedUsers) {
    await api.provision.createUser({ user, admin })
  }
}

export async function deleteUser({
  usersEnvironment,
  stepUser,
  targetUser
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  targetUser: string
}): Promise<void> {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const user = usersEnvironment.getUser({ key: targetUser })
  await api.provision.deleteUser({ user, admin })
}

export async function userHasCreatedFolder({
  usersEnvironment,
  stepUser,
  folderName
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  folderName: string
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.dav.createFolderInsidePersonalSpace({ user, folder: folderName })
}

export async function userHasCreatedFolders({
  usersEnvironment,
  stepUser,
  folderNames
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  folderNames: string[]
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  for (const folderName of folderNames) {
    await api.dav.createFolderInsidePersonalSpace({
      user,
      folder: folderName
    })
  }
}

export async function userHasCreatedFile({
  usersEnvironment,
  stepUser,
  filename
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  filename: string
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.dav.uploadFileInPersonalSpace({
    user,
    pathToFile: filename,
    content: 'This is a test file'
  })
}

export async function userHasSharedResource({
  usersEnvironment,
  stepUser,
  resource,
  recipient,
  type,
  role,
  resourceType
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  recipient: string
  type: string
  role: string
  resourceType: ResourceType
}): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.share.createShare({
    user,
    path: resource,
    shareType: type,
    shareWith: recipient,
    role: role,
    resourceType: resourceType as ResourceType
  })
}

export async function userHasCreatedPublicLinkOfResource({
  usersEnvironment,
  stepUser,
  resource,
  role,
  name,
  password,
  space
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  role: string
  name?: string
  password?: string
  space?: 'Personal'
}) {
  const user = usersEnvironment.getUser({ key: stepUser })

  await api.share.createLinkShare({
    user,
    path: resource,
    password: password,
    name: name ? name : 'Unnamed link',
    role: role,
    spaceName: space
  })
}

export async function userHasAssignRolesToUsers({
  usersEnvironment,
  stepUser,
  targetUserId,
  role
}: {
  usersEnvironment: UsersEnvironment
  stepUser: string
  targetUserId: string
  role: string
}) {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const user = usersEnvironment.getUser({ key: targetUserId })
  /**
   The oCIS API request for assigning roles allows only one role per user,
    whereas the Keycloak API request can assign multiple roles to a user.
    If multiple roles are assigned to a user in Keycloak,
    oCIS map the highest priority role among Keycloak assigned roles.
    Therefore, we need to unassign the previous role before
    assigning a new one when using the Keycloak API.
  */
  await api.provision.unAssignRole({ admin, user })
  await api.provision.assignRole({ admin, user, role })
}

export async function userHasCreatedProjectSpace({
  usersEnvironment,
  spacesEnvironment,
  stepUser,
  name,
  id
}: {
  usersEnvironment: UsersEnvironment
  spacesEnvironment: SpacesEnvironment
  stepUser: string
  name: string
  id: string
}) {
  const user = usersEnvironment.getUser({ key: stepUser })
  const spaceId = await api.graph.createSpace({ user, space: { id, name } as unknown as Space })
  spacesEnvironment.createSpace({
    key: id || name,
    space: { name: name, id: spaceId }
  })
}
