import { TokenEnvironmentFactory } from '../../environment'
import { config } from '../../../config'
import fetch, { Response } from 'node-fetch'
import { User } from '../../types'

const logonUrl = config.backendUrl + '/signin/v1/identifier/_/logon'
const redirectUrl = config.backendUrl + '/oidc-callback.html'
const tokenUrl = config.backendUrl + '/konnect/v1/token'

interface Token {
  access_token: string
  refresh_token: string
}

const getAuthorizedEndPoint = async (user: User): Promise<Array<string>> => {
  const logonResponse = await fetch(logonUrl, {
    method: 'POST',
    headers: {
      'Kopano-Konnect-XSRF': '1',
      Referer: config.backendUrl,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      params: [user.id, user.password, '1'],
      hello: {
        scope: 'openid profile email',
        client_id: 'web',
        redirect_uri: redirectUrl,
        flow: 'oidc'
      }
    })
  })
  if (logonResponse.status !== 200) {
    throw new Error(
      `Logon failed: Expected status code be 200 but received ${logonResponse.status} Message: ${logonResponse.statusText}`
    )
  }

  const cookies = logonResponse.headers.raw()['set-cookie']?.[0] || ''
  const data = (await logonResponse.json()) as { hello: { continue_uri: string } }
  const authorizedUrl = data.hello.continue_uri
  return [authorizedUrl, cookies]
}

const getCode = async ({
  continueUrl,
  cookies
}: {
  continueUrl: string
  cookies: string
}): Promise<string> => {
  const params = new URLSearchParams({
    client_id: 'web',
    prompt: 'none',
    redirect_uri: redirectUrl,
    response_mode: 'query',
    response_type: 'code',
    scope: 'openid profile offline_access email'
  })
  const authorizeResponse = await fetch(`${continueUrl}?${params.toString()}`, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      Cookie: cookies
    }
  })
  if (authorizeResponse.status !== 302) {
    throw new Error(
      `Authorization failed: Expected status code be 302 but received ${authorizeResponse.status} Message: ${authorizeResponse.statusText}`
    )
  }

  const locationHeader = authorizeResponse.headers.get('location')
  const urlParams = new URLSearchParams(new URL(locationHeader).search)

  if (locationHeader.includes('error=login_required')) {
    const errorDescription = urlParams.get('error_description')
    throw new Error(`Redirection failed. ${errorDescription}`)
  }
  return urlParams.get('code')
}

const getToken = async (code: string): Promise<Response> => {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: 'web',
      code: code,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code'
    })
  })
  if (response.status !== 200) {
    throw new Error(
      `Request failed: Expected status code be 200 but received ${response.status} Message: ${response.statusText}`
    )
  }
  return response
}

export const setAccessAndRefreshToken = async (user: User) => {
  const [authorizedUrl, cookies] = await getAuthorizedEndPoint(user)
  const code = await getCode({ continueUrl: authorizedUrl, cookies })
  const response = await getToken(code)
  const tokenList = (await response.json()) as Token

  const tokenEnvironment = TokenEnvironmentFactory()
  tokenEnvironment.setToken({
    user: { ...user },
    token: {
      userId: user.id,
      accessToken: tokenList.access_token,
      refreshToken: tokenList.refresh_token
    }
  })
}
