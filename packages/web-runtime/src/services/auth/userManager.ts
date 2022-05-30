import {
  Log,
  WebStorageStateStore,
  UserManager as OidcUserManager,
  UserManagerSettings,
  User
} from 'oidc-client-ts'
import { buildUrl } from '../../router'

export class UserManager extends OidcUserManager {
  private readonly storePrefix

  constructor(config) {
    const storePrefix = 'oc_oAuth' // FIXME: we want this unique and reproducible
    const userStore = new WebStorageStateStore({
      prefix: storePrefix,
      store: sessionStorage
    })
    const openIdConfig: UserManagerSettings = {
      userStore,
      redirect_uri: buildUrl('/oidc-callback.html'),
      silent_redirect_uri: buildUrl('/oidc-silent-redirect.html'),

      response_mode: 'query',
      response_type: 'code', // "code" triggers auth code grant flow

      post_logout_redirect_uri: buildUrl('/'),
      accessTokenExpiringNotificationTimeInSeconds: 10,
      authority: '',
      client_id: ''
    }

    if (config.openIdConnect) {
      Object.assign(openIdConfig, {
        scope: 'openid profile offline_access',
        loadUserInfo: true,
        ...config.openIdConnect
      })
    } else if (config.auth) {
      Object.assign(openIdConfig, {
        authority: config.auth.url,
        client_id: config.auth.clientId,
        client_authentication: 'client_secret_basic',
        client_secret: config.auth.clientSecret,

        scope: 'profile',
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

    super(openIdConfig)
    this.storePrefix = storePrefix
  }

  /**
   * Looks up the access token of an already loaded user without enforcing a signin if no user exists.
   *
   * @return (string|null)
   */
  getAccessToken(): string | null {
    const user = this.getStoredUserObject()
    return user?.access_token
  }

  /**
   * Looks up the current user without enforcing a signin if no user exists.
   * Returns null otherwise.
   *
   * @return (User|null)
   */
  getStoredUserObject(): User | null {
    const storageString = sessionStorage.getItem(this.storePrefix + this._userStoreKey)
    if (storageString) {
      const user = User.fromStorageString(storageString)
      if (user) {
        this.events.load(user, false)
        return user
      }
    }
    return null
  }
}
