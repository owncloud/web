import fetch from 'node-fetch'
import { TokenEnvironmentFactory } from '../../environment'

//for keycloak
const loginEndpoint = 'https://keycloak.owncloud.test/realms/oCIS/protocol/openid-connect/auth'

const tokenEndpoint = 'https://keycloak.owncloud.test/realms/oCIS/protocol/openid-connect/token'

const redirectUrl = 'https://ocis.owncloud.test/oidc-callback.html'

interface KeycloakToken {
  access_token: string
  refresh_token: string
}
async function login() {
  const loginParams = {
    client_id: 'web',
    redirect_uri: redirectUrl,
    response_mode: 'query',
    response_type: 'code',
    scope: 'openid profile email'
  }

  const queryString = new URLSearchParams(loginParams).toString()
  const loginUrl = `${loginEndpoint}?${queryString}`

  const response = await fetch(loginUrl, {
    method: 'GET',
    redirect: 'manual'
  })

  if (response.status === 302) {
    const locationHeader = response.headers.get('location')
    const urlParams = new URLSearchParams(new URL(locationHeader).search)
    const errorDescription = urlParams.get('error_description')
    throw new Error(`Unexpected redirection. ${errorDescription}`)
  } else if (response.status !== 200) {
    throw new Error(
      `Authorization failed: Expected status code be 200 but received ${response.status}. Message: ${response.statusText}`
    );
  }
  const cookies = response.headers.raw()['set-cookie']?.[0]
  const htmlString = await response.text()
  const regex = /action="([^"]+)"/
  const match = htmlString.match(regex)
  let actionUrl = ''
  if (!match) {
    throw new Error(
      'No action URL found.'
    )

  } else {
    actionUrl = match[1]
  }
  return [actionUrl, cookies]
}

async function getCode(user, url, cookie) {
  const formData = new URLSearchParams()

  formData.append('username', user.id)
  formData.append('password', user.password)

  const authorizationResponse = await fetch(url, {
    method: 'POST',
    body: formData,
    redirect: 'manual',
    headers: {
      Cookie: cookie
    }
  })
  if (authorizationResponse.status !== 302) {
    throw new Error(
      `Login failed: Expected status code be 302 but received ${authorizationResponse.status}. Message: ${authorizationResponse.statusText}`
    )
  }
  const locationHeader = authorizationResponse.headers.get('location')

  const urlParams = new URLSearchParams(new URL(locationHeader).search)
  return urlParams.get('code')
}

async function getToken(code) {
  const accessTokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: 'web',
      code: code,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code'
    })
  })
  if (accessTokenResponse.status !== 200) {
    throw new Error(
      `Login failed: Expected status code be 200 but received ${accessTokenResponse.status}. Message: ${accessTokenResponse.statusText}`
    );
  }
  return accessTokenResponse
}

export const setAccessTokenForKeycloakUser = async (user) => {
  const [authorizedUrl, cookies] = await login()
  const code = await getCode(user, authorizedUrl, cookies)
  const response = await getToken(code)
  const tokenList = (await response.json()) as KeycloakToken

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
