import { config } from '../e2e/config'
import { UsersEnvironment } from '../e2e/support/environment'
import { api } from '../e2e/support'
import { ResourceType } from '../e2e/support/api/share/share'

export async function createUserUsingAPI(
  usersEnvironment: UsersEnvironment,
  stepUser: string,
  userToBeCreated: string
): Promise<void> {
  const admin = usersEnvironment.getUser({ key: stepUser })
  const user = usersEnvironment.getUser({ key: userToBeCreated })
  // do not try to create users when using predefined users
  if (!config.predefinedUsers) {
    await api.provision.createUser({ user, admin })
  }
}

export async function createFolderInPersonalSpaceUsingAPI(
  usersEnvironment: UsersEnvironment,
  stepUser: string,
  folderName: string
): Promise<void> {
  const user = usersEnvironment.getUser({ key: stepUser })
  await api.dav.createFolderInsidePersonalSpace({ user, folder: folderName })
}

export async function shareResourceUsingAPI(
  usersEnvironment: UsersEnvironment,
  stepUser: string,
  resource: string,
  recipient: string,
  type: string,
  role: string,
  resourceType: ResourceType
): Promise<void> {
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

export async function createPublicLinkOfResourceUsingAPI(
  usersEnvironment: UsersEnvironment,
  stepUser: string,
  resource: string,
  role: string,
  name?: string,
  password?: undefined,
  space?: 'Personal'
) {
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
