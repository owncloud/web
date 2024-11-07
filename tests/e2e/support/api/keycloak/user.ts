import join from 'join-path'
import { getIdFromResponse, request, realmBasePath } from './utils'
import { deleteUser as graphDeleteUser, getUserId } from '../graph'
import { checkResponseStatus } from '../http'
import {User, KeycloakRealmRole, Group} from '../../types'
import { UsersEnvironment } from '../../environment'
import { keycloakRealmRoles } from '../../store'
import { state } from '../../../cucumber/environment/shared'
import { initializeUser } from '../../utils/tokenHelper'
import { setAccessTokenForKeycloakOcisUser } from './ocisUserToken'

const ocisKeycloakUserRoles: Record<string, string> = {
  Admin: 'ocisAdmin',
  'Space Admin': 'ocisSpaceAdmin',
  User: 'ocisUser',
  'User Light': 'ocisGuest'
}

export const createUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  const fullName = user.displayName.split(' ')
  const body = JSON.stringify({
    username: user.id,
    credentials: [{ value: user.password, type: 'password' }],
    firstName: fullName[0],
    lastName: fullName[1] ?? '',
    email: user.email,
    emailVerified: true,
    // NOTE: setting realmRoles doesn't work while creating user.
    // Issue in Keycloak:
    //  - https://github.com/keycloak/keycloak/issues/9354
    //  - https://github.com/keycloak/keycloak/issues/16449
    // realmRoles: ['ocisUser', 'offline_access'],
    enabled: true
  })

  // create a user
  const creationRes = await request({
    method: 'POST',
    path: join(realmBasePath, 'users'),
    body,
    user: admin,
    header: { 'Content-Type': 'application/json' }
  })
  checkResponseStatus(creationRes, 'Failed while creating user')

  // created user id
  const keycloakUUID = getIdFromResponse(creationRes)

  // assign realmRoles to user
  const defaultNewUserRole = 'User'
  const roleRes = await assignRole({ admin, uuid: keycloakUUID, role: defaultNewUserRole })
  checkResponseStatus(roleRes, 'Failed while assigning roles to user')

  const usersEnvironment = new UsersEnvironment()
  // stored keycloak user information on storage
  usersEnvironment.storeCreatedKeycloakUser({
    user: { ...user, uuid: keycloakUUID, role: defaultNewUserRole }
  })

  // login to initialize the user in oCIS Web
  await initializeUser({
    browser: state.browser,
    user,
    waitForSelector: '#web-content'
  })

  // store oCIS user information
  usersEnvironment.storeCreatedUser({
    user: { ...user, uuid: await getUserId({ user, admin }), role: defaultNewUserRole }
  })
  await setAccessTokenForKeycloakOcisUser(user)
  return user
}

export const assignRole = async ({
  admin,
  uuid,
  role
}: {
  admin: User
  uuid: string
  role: string
}) => {
  // can assign multiple realm role at once
  return request({
    method: 'POST',
    path: join(realmBasePath, 'users', uuid, 'role-mappings', 'realm'),
    body: JSON.stringify([
      await getRealmRole(ocisKeycloakUserRoles[role], admin),
      await getRealmRole('offline_access', admin)
    ]),
    user: admin,
    header: { 'Content-Type': 'application/json' }
  })
}

export const unAssignRole = async ({
  admin,
  uuid,
  role
}: {
  admin: User
  uuid: string
  role: string
}) => {
  // can't unassign multiple realm roles at once
  const response = await request({
    method: 'DELETE',
    path: join(realmBasePath, 'users', uuid, 'role-mappings', 'realm'),
    body: JSON.stringify([await getRealmRole(ocisKeycloakUserRoles[role], admin)]),
    user: admin,
    header: { 'Content-Type': 'application/json' }
  })
  checkResponseStatus(response, 'Can not delete existing role ')
  return response
}

export const deleteUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  // first delete ocis user
  // deletes the user data
  await graphDeleteUser({ user, admin })

  const usersEnvironment = new UsersEnvironment()
  const keyclockUser = usersEnvironment.getCreatedKeycloakUser({ key: user.id })
  const response = await request({
    method: 'DELETE',
    path: join(realmBasePath, 'users', keyclockUser.uuid),
    user: admin
  })
  checkResponseStatus(response, 'Failed to delete keycloak user: ' + user.id)
  if (response.ok) {
    try {
      const usersEnvironment = new UsersEnvironment()
      usersEnvironment.removeCreatedKeycloakUser({ key: user.id })
    } catch (e) {
      console.error('Error removing Keycloak user:', e)
    }
  }
  return user
}

export const getRealmRole = async (role: string, admin: User): Promise<KeycloakRealmRole> => {
  if (keycloakRealmRoles.get(role)) {
    return keycloakRealmRoles.get(role)
  }

  const response = await request({
    method: 'GET',
    path: join(realmBasePath, 'roles'),
    user: admin
  })
  checkResponseStatus(response, 'Failed while fetching realm roles')
  const roles = (await response.json()) as KeycloakRealmRole[]

  roles.forEach((role: KeycloakRealmRole) => {
    keycloakRealmRoles.set(role.name, role)
  })

  if (keycloakRealmRoles.get(role)) {
    return keycloakRealmRoles.get(role)
  }

  throw new Error(`Role '${role}' not found in the keycloak realm`)
}

export const createGroup = async ({ group, admin }: { group: Group; admin: User }): Promise<Group> => {
  const body = JSON.stringify({
    name: group.displayName
  })
  // create a user
  const creationResponse = await request({
    method: 'POST',
    path: join(realmBasePath, 'groups'),
    body,
    user: admin
  })
  checkResponseStatus(creationResponse, 'Failed while creating user')

  // created group id
  const keycloakGroupID = getIdFromResponse(creationResponse)

  // assign created group to admin
  const defaultUser = 'Admin'
  const addUserToGroupRes = addUserToGroup({ admin, uuid: keycloakUUID, groupId: keycloakGroupID })
  checkResponseStatus(addUserToGroupRes, 'Failed while adding user to group')

  const usersEnvironment = new UsersEnvironment()
  // stored keycloak user information on storage
  usersEnvironment.storeCreatedKeycloakGroup({ group: { ...group, uuid: keycloakGroupID } })

  return group
}

export const addUserToGroup = ({ admin, uuid, groupId}: { admin: User; uuid: string; groupId: string }) => {
  return request({
    method: 'POST',
    path: join(realmBasePath, 'users', uuid, 'groups', groupId),
    user: admin
  })
}
