import { checkResponseStatus, checkOCJsonStatus, request } from './http'
import { User } from '../types'
import { URLSearchParams } from 'url'
import join from 'join-path'

export const createUser = async ({ user, admin }: { user: User; admin: User }): Promise<void> => {
  const promChain = []
  {
    const body = new URLSearchParams()
    body.append('username', user.id)
    body.append('email', user.email)
    body.append('userid', user.id)
    body.append('password', user.password)
    body.append('displayname', user.displayName)

    const response = await request({
      method: 'POST',
      path: join('ocs', 'v2.php', 'cloud', 'users'),
      body: body,
      user: admin
    })
    checkResponseStatus(response, 'Failed while creating user')

    const json = await response.json()
    checkOCJsonStatus(json, 'Failed while creating user')
  }

  ;[
    ['display', user.displayName],
    ['email', user.email]
  ].forEach((kv) => {
    const body = new URLSearchParams()
    body.append('key', kv[0])
    body.append('value', kv[1])
    promChain.push(
      request({
        method: 'PUT',
        path: join('ocs', 'v2.php', 'cloud', 'users', encodeURIComponent(user.id)),
        body,
        user: admin
      })
    )
  })

  // getUser is there because ocis needs to have at least 1 request to the created user to perform deleteRequests later
  // twice because it works, known issue and needs to be cleaned up once the ocis users service is moved to reva
  for (const prom of [await getUser({ user }), ...promChain, await getUser({ user })]) {
    await prom
  }
}

export const deleteUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  await request({
    method: 'DELETE',
    path: join('ocs', 'v2.php', 'cloud', 'users', encodeURIComponent(user.id)),
    user: admin
  })

  return user
}

export const getUser = async ({ user }: { user: User }): Promise<User> => {
  await request({
    method: 'GET',
    path: join('ocs', 'v2.php', 'cloud', 'users', user.id),
    user
  })

  return user
}
