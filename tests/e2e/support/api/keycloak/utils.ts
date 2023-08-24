import join from 'join-path'
import { BodyInit, Response } from 'node-fetch'
import { request as httpRequest } from '../http'
import { User } from '../../types'
import { TokenEnvironmentFactory } from '../../environment'

export const realmBasePath = 'admin/realms/oCIS'

export const request = async (args: {
  method: 'POST' | 'DELETE' | 'PUT' | 'GET' | 'MKCOL' | 'PROPFIND' | 'PATCH'
  path: string
  body?: BodyInit
  user?: User
  header?: object
}): Promise<Response> => {
  return httpRequest({ ...args, isKeycloakRequest: true })
}

export const getUserIdFromResponse = (response: Response): string => {
  return response.headers.get('location').split('/').pop()
}

export const refreshToken = async ({ user }: { user: User }): Promise<void> => {
  const tokenEnvironment = TokenEnvironmentFactory('keycloak')

  const body = new URLSearchParams()
  body.append('client_id', 'security-admin-console')
  body.append('grant_type', 'refresh_token')
  body.append('refresh_token', tokenEnvironment.getToken({ user }).refreshToken)

  const response = await request({
    method: 'POST',
    path: join('realms', 'master', 'protocol', 'openid-connect', 'token'),
    body,
    header: { 'Content-Type': 'application/x-www-form-urlencoded' },
    user
  })

  const resBody = await response.json()

  // update tokens
  tokenEnvironment.setToken({
    user: { ...user },
    token: {
      userId: user.id,
      accessToken: resBody.access_token,
      refreshToken: resBody.refresh_token
    }
  })
}
