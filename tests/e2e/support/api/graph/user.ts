import { checkResponseStatus, request } from '../http'
import { Me, User } from '../../types'
import join from 'join-path'

export const me = async ({ user }: { user: User }): Promise<Me> => {
  const response = await request({
    method: 'GET',
    path: join('graph', 'v1.0', 'me'),
    user
  })

  return await response.json()
}

export const createUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  const body = JSON.stringify({
    displayName: user.displayName,
    mail: user.email,
    onPremisesSamAccountName: user.id,
    passwordProfile: { password: user.password }
  })

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1.0', 'users'),
    body,
    user: admin
  })

  checkResponseStatus(response, 'Failed while creating user')
  return user
}

export const deleteUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  await request({
    method: 'DELETE',
    path: join('graph', 'v1.0', 'users', user.id),
    user: admin
  })

  return user
}
