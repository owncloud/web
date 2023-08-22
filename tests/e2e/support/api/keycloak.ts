import { checkResponseStatus, request } from './http'
import { User } from '../types'
import join from 'join-path'
import { createdKeycloakRefreshTokenStore } from '../store/token'

export const refreshToken = async (): Promise<void> => {
  const body = JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: createdKeycloakRefreshTokenStore.get('keycloakAdmin'),
    client_id: 'security-admin-console'
  })

  // need send request with cookie
  const response = await request({
    method: 'POST',
    path: join('realms', 'master', 'protocol', 'openid-connect', 'token'),
    body: body,
    header: { 'Content-Type': 'application/json' },
    keycloakAdminUrl: true
  })
  console.log(await response.json(), 'bshdjbvhjsbdjhbsdjhbvcjh')
}

export const getUser = async ({ user }: { user: User }): Promise<User> => {
  // refreshToken()

  const response = await request({
    method: 'GET',
    path: join('admin', 'realms', 'oCIS', 'ui-ext', 'brute-force-user'),
    header: { 'Content-Type': 'application/json' },
    keycloakAdminUrl: true
  })

  checkResponseStatus(response, 'Failed while getting user in keycloak admin console')
  // I could not get response body
  console.log(response.text(), 'repsdkvopcks')

  return user
}

// not needed

// export const createUser = async ({ user }: { user: User }): Promise<User> => {
//   const body = JSON.stringify({
//     username: user.id,
//     email: user.email,
//     firstName: user.displayName,
//     lastName: '',
//     requiredActions: [],
//     emailVerified: false,
//     groups: [],
//     enabled: true
//   })
//   const response = await request({
//     method: 'POST',
//     path: join('admin', 'realms', 'oCIS', 'users'),
//     body,
//     header: { 'Content-Type': 'application/json' },
//     keycloakAdminUrl: true
//   })

//   checkResponseStatus(response, 'Failed while creating user')
//   return user
// }

//TODO addUserToGroup() deleteUserFromGrop() assighRoleToUser() deleteUserRole()
