import join from 'join-path'
import { getUserIdFromResponse, request, realmBasePath } from './utils'
import {deleteUser as graphDeleteUser, getUserId} from '../graph'
import { checkResponseStatus } from '../http'
import { User, KeycloakRealmRole } from '../../types'
import { UsersEnvironment } from '../../environment'
import { keycloakRealmRoles } from '../../store'
import { state } from '../../../cucumber/environment/shared'
import { getTokenFromLogin } from '../../utils/tokenHelper'

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
  const uuid = getUserIdFromResponse(creationRes)

  // assign realmRoles to user
  const defaultNewUserRole = 'User'
  const roleRes = await assignRole({ admin, uuid, role: defaultNewUserRole })
  checkResponseStatus(roleRes, 'Failed while assigning roles to user')

  const usersEnvironment = new UsersEnvironment()
    usersEnvironment.storeCreatedKeycloakUser({ user: { ...user, uuid, role: defaultNewUserRole } })

  // initialize user
  await initializeUser(user.id)

    usersEnvironment.storeCreatedUser({ user: { ...user, uuid:(await getUserId({user, admin})), role: defaultNewUserRole } })
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

const initializeUser = async (username: string): Promise<void> => {
  return await getTokenFromLogin({
    browser: state.browser,
    username,
    waitForSelector: '#web-content'
  })
}

export const deleteUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  // first delete ocis user
  // deletes the user data
  await graphDeleteUser({ user, admin })

  const response = await request({
    method: 'DELETE',
    path: join(realmBasePath, 'users', user.uuid),
    user: admin
  })
  checkResponseStatus(response, 'Failed to delete keycloak user: ' + user.id)

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
