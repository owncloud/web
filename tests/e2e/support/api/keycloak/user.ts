import join from 'join-path'
import { getUserIdFromResponse, request, realmBasePath } from './utils'
import { deleteUser as graphDeleteUser } from '../graph'
import { checkResponseStatus } from '../http'
import { User, KeycloakRealmRole } from '../../types'
import { UsersEnvironment } from '../../environment'
import { keycloakRealmRoles } from '../../store'
import { state } from '../../../cucumber/environment/shared'
import { getTokenFromLogin } from '../../utils/tokenHelper'

const userRole: Record<string, string> = {
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
  const roleRes = await assignRole({ admin, uuid, role: 'User' })
  checkResponseStatus(roleRes, 'Failed while assigning roles to user')

  const usersEnvironment = new UsersEnvironment()
  usersEnvironment.storeCreatedUser({ user: { ...user, uuid } })

  // initialize user
  await initializeUser(user.id)

  return user
}

export const assignRole = async ({ admin, uuid, role }) => {
  return await request({
    method: 'POST',
    path: join(realmBasePath, 'users', uuid, 'role-mappings', 'realm'),
    body: JSON.stringify([
      await getRealmRole(userRole[role], admin),
      await getRealmRole('offline_access', admin)
    ]),
    user: admin,
    header: { 'Content-Type': 'application/json' }
  })
}

const initializeUser = async (username: string): Promise<void> => {
  return getTokenFromLogin({ browser: state.browser, username, waitForSelector: '#web-content' })
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
  const roles = await response.json()

  roles.forEach((role: KeycloakRealmRole) => {
    keycloakRealmRoles.set(role.name, role)
  })

  if (keycloakRealmRoles.get(role)) {
    return keycloakRealmRoles.get(role)
  }

  throw new Error(`Role '${role}' not found in the keycloak realm`)
}
