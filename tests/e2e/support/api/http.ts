import join from 'join-path'
import fetch, { BodyInit, Response } from 'node-fetch'
import { User } from '../types'
import { config } from '../../config'
import { TokenEnvironmentFactory } from '../environment'

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
  const tokenEnvironment = TokenEnvironmentFactory(isKeycloakRequest ? 'keycloak' : null)

  const authHeader = {
    Authorization: 'Bearer ' + tokenEnvironment.getToken({ user }).accessToken
  }

  const baseUrl = isKeycloakRequest ? config.keycloakUrl : config.backendUrl
  return await fetch(join(baseUrl, path), {
    method,
    body,
    headers: authHeader
  })
}

export const checkResponseStatus = (response: Response, message = ''): void => {
  // response.status >= 200 && response.status < 300
  if (!response.ok) {
    throw Error(`HTTP Request Failed: ${message}, Status: ${response.status}`)
  }
}
