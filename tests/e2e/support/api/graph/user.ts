import { checkResponseStatus, checkOCJsonStatus, request } from '../http'
import { User } from '../../types'
import join from 'join-path'

export const createUser = async ({ user, admin }: { user: User; admin: User }): Promise<void> => {
  const body = JSON.stringify({
    displayName: user.displayName,
    mail: user.email,
    onPremisesSamAccountName: user.id,
    passwordProfile: { password: user.password }
  })

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1.0', 'users'),
    body: body,
    user: admin
  })
  checkResponseStatus(response, 'Failed while creating user')
}

export const deleteUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  await request({
    method: 'DELETE',
    path: join('graph', 'v1.0', 'users', user.id),
    user: admin
  })

  return user
}
