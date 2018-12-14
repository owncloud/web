import Axios from 'axios'
import { VueAuthenticate } from 'vue-authenticate'

export function initVueAuthenticate (config) {
  if (config) {
    return new VueAuthenticate(Axios, {
      tokenPrefix: 'oc_oAuth',
      providers: {
        oauth2: {
          name: 'ownCloud',
          clientId: config.clientId,
          url: config.apiUrl,
          authorizationEndpoint: config.authUrl,
          redirectUri: window.location.href,
          responseType: 'token',
          responseParams: {
            code: 'code',
            clientId: 'client_id',
            redirectUri: 'redirect_uri'
          }
        }
      }
    })
  }
}

export default initVueAuthenticate
