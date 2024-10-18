import join from 'join-path'
import fetch, { BodyInit, Response } from 'node-fetch'
import { User } from '../types'
import { config } from '../../config'
import { TokenEnvironmentFactory } from '../environment'

export const getAuthHeader = (user: User, isKeycloakRequest: boolean = false) => {
  const tokenEnvironment = TokenEnvironmentFactory(isKeycloakRequest ? 'keycloak' : null)
  const authHeader = {
    Authorization: 'Basic ' + Buffer.from(user.id + ':' + user.password).toString('base64')
  }

  if (!config.basicAuth) {
    authHeader.Authorization = 'Bearer ' + tokenEnvironment.getToken({ user }).accessToken
  }
  return authHeader
}

export const request = async ({
  method,
  path,
  body,
  user,
  header = {},
  isKeycloakRequest = false
}: {
  method: 'POST' | 'DELETE' | 'PUT' | 'GET' | 'MKCOL' | 'PROPFIND' | 'PATCH'
  path: string
  body?: BodyInit
  user?: User
  header?: object
  isKeycloakRequest?: boolean
}): Promise<Response> => {
  const authHeader = getAuthHeader(user, isKeycloakRequest)

  const basicHeader = {
    'OCS-APIREQUEST': true as any,
    ...(user.id && authHeader),
    ...header
  }

  const baseUrl = isKeycloakRequest ? config.keycloakUrl : config.baseUrl

  return await fetch(join(baseUrl, path), {
    method,
    body,
    headers: basicHeader
  })
}

export const checkResponseStatus = (response: Response, message = ''): void => {
  // response.status >= 200 && response.status < 300
  if (!response.ok) {
    throw Error(`HTTP Request Failed: ${message}, Status: ${response.status}`)
  }
}
