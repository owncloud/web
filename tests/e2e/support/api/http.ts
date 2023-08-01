import join from 'join-path'
import fetch, { BodyInit, Response } from 'node-fetch'
import { User } from '../types'
import { config } from '../../config'
import { TokenEnvironment } from '../environment'
import { createdKeycloakAccessTokenStore } from '../store/token'

export const request = async ({
  method,
  path,
  body,
  user,
  formatJson = true,
  header = {},
  keycloakAdminUrl = false
}: {
  method: 'POST' | 'DELETE' | 'PUT' | 'GET' | 'MKCOL' | 'PROPFIND' | 'PATCH'
  path: string
  body?: BodyInit
  user?: User
  formatJson?: boolean
  header?: object
  keycloakAdminUrl?: boolean
}): Promise<Response> => {
  const tokenEnvironment = new TokenEnvironment()

  let url
  let token

  if (keycloakAdminUrl) {
    url = process.env.KEYCLOAK_ADMIN_CONSOLE_URL || 'https://keycloak.owncloud.test'
    token = createdKeycloakAccessTokenStore.get('keycloakAdmin')
  } else {
    url = config.backendUrl
    token = tokenEnvironment.getToken({ user }).tokenValue
  }

  const basicHeader = {
    'OCS-APIREQUEST': true as any,
    ...(user && {
      Authorization: config.apiToken
        ? 'Bearer ' + token
        : 'Basic ' + Buffer.from(user.id + ':' + user.password).toString('base64')
    }),
    ...header
  }

  return await fetch(join(config.backendUrl, path), {
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
