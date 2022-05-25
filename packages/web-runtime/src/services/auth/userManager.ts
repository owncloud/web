import {
  Log,
  WebStorageStateStore,
  UserManager as OidcUserManager,
  UserManagerSettings
} from 'oidc-client-ts'
import { buildUrl } from '../../router'
import * as Console from 'console'

export class UserManager extends OidcUserManager {
  constructor(config) {
    const userStore = new WebStorageStateStore({
      prefix: 'oc_oAuth',
      store: sessionStorage
    })
    const openIdConfig: UserManagerSettings = {
      userStore,
      redirect_uri: buildUrl('/oidc-callback.html'),
      silent_redirect_uri: buildUrl('/oidc-silent-redirect.html'),
      response_mode: 'query',
      post_logout_redirect_uri: buildUrl('/'),
      accessTokenExpiringNotificationTimeInSeconds: 10,
      authority: '',
      client_id: ''
    }

    if (config.openIdConnect) {
      Object.assign(openIdConfig, {
        response_type: 'code', // "code" triggers auth code grant flow
        scope: 'openid profile offline_access',
        loadUserInfo: true,
        ...config.openIdConnect
      })
    } else if (config.auth) {
      Object.assign(openIdConfig, {
        authority: config.auth.url,
        client_id: config.auth.clientId,
        response_type: 'token', // token is implicit flow - to be killed
        scope: 'openid profile',
        loadUserInfo: false,
        metadata: {
          issuer: config.auth.url,
          authorization_endpoint: config.auth.authUrl,
          token_endpoint: config.auth.url,
          userinfo_endpoint: ''
        }
      })
    }

    Log.setLevel(Log.INFO)
    Log.setLogger(Console)

    super(openIdConfig)
  }

  /**
   * old code that can potentially be removed entirely

  getToken() {
    const storageString = sessionStorage.getItem('oc_oAuth' + this.manager._userStoreKey)
    if (storageString) {
      const user = User.fromStorageString(storageString)
      if (user) {
        this.manager.events.load(user, false)
        return user.access_token
      }
    }
    return null
  }

  getStoredUserObject() {
    this.userStore.get()
    const storageString = sessionStorage.getItem('oc_oAuth' + this.manager._userStoreKey)
    if (storageString) {
      const user = User.fromStorageString(storageString)
      if (user) {
        this.manager.events.load(user, false)
        return user
      }
    }
    return null
  }

  createSignoutRequest(idToken) {
    return new Promise((resolve, reject) => {
      this.manager
        .signoutRedirect()
        .createSignoutRequest(idToken)
        .then((signoutRequest) => resolve(signoutRequest.url))
        .catch((error) => reject(error))
    })
  }

   */
}
