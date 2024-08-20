import { TokenEnvironmentFactory } from '../../environment'
import { config } from '../../../config'
import fetch, { Response } from 'node-fetch'
import { User } from '../../types'

const logonUrl = config.backendUrl + '/signin/v1/identifier/_/logon'
const redirectUrl = config.backendUrl + '/oidc-callback.html'
const tokenUrl = config.backendUrl + '/konnect/v1/token'

interface token {
  access_token: string
  refresh_token: string
}

const getAuthorizedEndPoint = async ({ user }: { user: User }): Promise<Array<string>> => {
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
    throw new Error(`logonResponse.status is ${logonResponse.status}, expected 200`)
  }
  const cookies = logonResponse.headers.raw()['set-cookie']
  const data = await logonResponse.json()
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
    throw new Error(`logonResponse.status is ${authorizeResponse.status}, expected 302`)
  }
  const locationHeader = authorizeResponse.headers.get('location')
  const urlParams = new URLSearchParams(new URL(locationHeader).search)
  return urlParams.get('code')
}

const getToken = async ({
  code,
  cookies
}: {
  code: string
  cookies: string
}): Promise<Response> => {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Cookie: cookies
    },
    body: new URLSearchParams({
      client_id: 'web',
      code: code,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code'
    })
  })
  if (response.status !== 200) {
    throw new Error(`logonResponse.status is ${response.status}, expected 200`)
  }
  return response
}

export const setAccessAndRefreshToken = async ({ user }: { user: User }) => {
  const [authorizedUrl, cookies] = await getAuthorizedEndPoint({ user })
  const code = await getCode({ continueUrl: authorizedUrl, cookies })
  const response = await getToken({ code, cookies })
  const tokenList = (await response.json()) as token

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
