import fetch from 'node-fetch'
// import {User} from "../../types";
// import {TokenEnvironmentFactory} from "../../environment";

//for keycloak
const loginEndpoint = 'https://keycloak.owncloud.test/realms/oCIS/protocol/openid-connect/auth'

// const tokenEndpoint = 'https://keycloak.owncloud.test/realms/oCIS/protocol/openid-connect/token'

const redirectUrl = 'https://ocis.owncloud.test/oidc-callback.html'

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

  return await fetch(loginUrl, {
    method: 'GET',
    redirect: 'manual'
  })
}

// async function submitLoginForm(url, cookieJar) {
//   const formData = new URLSearchParams()
//
//   formData.append('username', 'admin')
//   formData.append('password', 'admin')
//
//   const authorizationResponse = await fetch(url, {
//     method: 'POST',
//     body: formData,
//     redirect: 'manual',
//     headers: {
//       Cookie: cookieJar
//     }
//   })
//
//   const locationHeader = authorizationResponse.headers.get('location')
//
//   const urlParams = new URLSearchParams(new URL(locationHeader).search)
//   return urlParams.get('code')
// }

// async function getToken(code, cookieJar) {
//   const accessTokenResponse = await fetch(tokenEndpoint, {
//     method: 'POST',
//
//     body: new URLSearchParams({
//       client_id: 'web',
//       code: code,
//       redirect_uri: redirectUrl,
//       grant_type: 'authorization_code'
//     })
//   })
//   console.log(await accessTokenResponse.json())
// }

export const setAccessTokenForKeycloakUser = async () => {



  const resp = await login()
  // const cookies = resp.headers.raw()['set-cookie']
  const htmlString = await resp.text()
  await page.locator('#kc-form-wrapper')
  console.log(htmlString)
}
