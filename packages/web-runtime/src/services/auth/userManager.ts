import {
  Log,
  WebStorageStateStore,
  UserManager as OidcUserManager,
  UserManagerSettings,
  User
} from 'oidc-client-ts'
import { buildUrl } from '../../router'
import { ConfigurationManager } from 'web-pkg/src/configuration'

export class UserManager extends OidcUserManager {
  private readonly storePrefix

  constructor(configurationManager: ConfigurationManager) {
    const storePrefix = 'oc_oAuth.' // FIXME: we want this unique and reproducible
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

    if (configurationManager.isOIDC) {
      Object.assign(openIdConfig, {
        scope: 'openid profile offline_access',
        loadUserInfo: true,
        ...configurationManager.oidc
      })
    } else if (configurationManager.isOAuth2) {
      const oAuth2 = configurationManager.oAuth2
      Object.assign(openIdConfig, {
        authority: oAuth2.url,
        client_id: oAuth2.clientId,
        client_authentication: 'client_secret_basic',
        client_secret: oAuth2.clientSecret,

        scope: 'profile',
        loadUserInfo: false,
        metadata: {
          issuer: oAuth2.url,
          authorization_endpoint: oAuth2.authUrl,
          token_endpoint: oAuth2.url,
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
  async getAccessToken(): Promise<string | null> {
    const user = await this.getUser()
    return user?.access_token
  }
}
