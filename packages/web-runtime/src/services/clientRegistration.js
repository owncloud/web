async function get(url) {
  return await fetch(url)
    .then((res) => {
      return res.json()
    })
    .catch((err) => {
      console.error('Error: ', err)
    })
}

async function post(url, data) {
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((res) => {
      return res.json()
    })
    .catch((err) => {
      console.error('Error: ', err)
    })
}

export async function registerClient(openIdConfig) {
  const clientData = sessionStorage.getItem('dynamicClientData')
  if (clientData !== null) {
    // eslint-disable-next-line camelcase
    const client_secret_expires_at = clientData.client_secret_expires_at || 0
    // eslint-disable-next-line camelcase
    if (client_secret_expires_at === 0 || Date.now() < client_secret_expires_at * 1000) {
      return JSON.parse(clientData)
    }
  }
  sessionStorage.removeItem('dynamicClientData')

  let baseUrl = window.location.href.split('#')[0]
  if (baseUrl.endsWith('/index.html')) {
    baseUrl = baseUrl.substr(0, baseUrl.length - 10)
  }

  const wellKnown = await get(`${openIdConfig.authority}/.well-known/openid-configuration`)
  const resp = await post(wellKnown.registration_endpoint, {
    redirect_uris: [baseUrl + 'oidc-callback.html'],
    client_name: `ownCloud Web on ${baseUrl}`
  })
  sessionStorage.setItem('dynamicClientData', JSON.stringify(resp))
  return resp
}
