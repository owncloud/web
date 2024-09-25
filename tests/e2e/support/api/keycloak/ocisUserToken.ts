import fetch from 'node-fetch'
import { TokenEnvironmentFactory } from '../../environment'
import { config } from '../../../config'
import { User } from '../../types'

interface KeycloakToken {
  access_token: string
  refresh_token: string
}

const authorizationEndpoint = config.keycloakUrl + '/realms/oCIS/protocol/openid-connect/auth'
const tokenEndpoint = config.keycloakUrl + '/realms/oCIS/protocol/openid-connect/token'
const redirectUrl = config.backendUrl + '/oidc-callback.html'

async function getAuthorizationEndPoint() {
  const loginParams = {
    client_id: 'web',
    redirect_uri: redirectUrl,
    response_mode: 'query',
    response_type: 'code',
    scope: 'openid profile email'
  }
  const queryString = new URLSearchParams(loginParams).toString()
  const authorizationUrl = `${authorizationEndpoint}?${queryString}`

  const authorizationResponse = await fetch(authorizationUrl, {
    method: 'GET',
    redirect: 'manual'
  })

  if (authorizationResponse.status === 302) {
    const locationHeader = authorizationResponse.headers.get('location')
    const urlParams = new URLSearchParams(new URL(locationHeader).search)
    const errorDescription = urlParams.get('error_description')
    throw new Error(`Unexpected redirection. ${errorDescription}`)
  } else if (authorizationResponse.status !== 200) {
    throw new Error(
      `Authorization failed: Expected status code be 200 but received ${authorizationResponse.status}. Message: ${authorizationResponse.statusText}`
    )
  }

  const cookies = authorizationResponse.headers.raw()['set-cookie']?.[0]
  const htmlData = await authorizationResponse.text()

  //regex to match the url received in the response html body
  const match = htmlData.match(/action="([^"]+)"/)
  let auhorizationUrl
  if (!match) {
    throw new Error('No URL found.')
  } else {
    auhorizationUrl = match[1]
  }
  return [auhorizationUrl, cookies]
}

const getCode = async (user, auhorizationUrl: string, cookies: string) => {
  const authCodeResponse = await fetch(auhorizationUrl, {
    method: 'POST',
    body: new URLSearchParams({
      username: user.id,
      password: user.password
    }),
    redirect: 'manual',
    headers: {
      Cookie: cookies
    }
  })

  if (authCodeResponse.status !== 302) {
    throw new Error(
      `Login failed: Expected status code be 302 but received ${authCodeResponse.status}. Message: ${authCodeResponse.statusText}`
    )
  }

  const locationHeader = authCodeResponse.headers.get('location')
  const urlParams = new URLSearchParams(new URL(locationHeader).search)
  return urlParams.get('code')
}

const getToken = async (authorizationCode: string) => {
  const tokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: 'web',
      code: authorizationCode,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code'
    })
  })

  if (tokenResponse.status !== 200) {
    throw new Error(
      `Login failed: Expected status code be 200 but received ${tokenResponse.status}. Message: ${tokenResponse.statusText}`
    )
  }

  return tokenResponse
}

export const setAccessTokenForKeycloakUser = async (user: User) => {
  const [auhorizationUrl, cookies] = await getAuthorizationEndPoint()
  const authorizationCode = await getCode(user, auhorizationUrl, cookies)
  const tokenResponse = await getToken(authorizationCode)
  const tokenList = (await tokenResponse.json()) as KeycloakToken

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
