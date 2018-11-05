import Axios from 'axios'
import { VueAuthenticate } from 'vue-authenticate'

export function initVueAuthenticate (config) {
  if (config) {
    return new VueAuthenticate(Axios, {
      providers: {
        oauth2: {
          name: 'ownCloud',
          clientId: config.clientId || '',
          url: config.apiUrl || '',
          authorizationEndpoint: config.authUrl || '',
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
