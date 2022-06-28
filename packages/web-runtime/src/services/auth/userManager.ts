import {
  Log,
  WebStorageStateStore,
  UserManager as OidcUserManager,
  UserManagerSettings
} from 'oidc-client-ts'
import { buildUrl } from '../../router'
import { ConfigurationManager } from 'web-pkg/src/configuration'
import { ClientService } from 'web-pkg/src/services'
import { Store } from 'vuex'
import isEmpty from 'lodash-es/isEmpty'

const postLoginRedirectUrlKey = 'oc.postLoginRedirectUrl'

export interface UserManagerOptions {
  clientService: ClientService
  configurationManager: ConfigurationManager
  store: Store<any>
}

export class UserManager extends OidcUserManager {
  private readonly storePrefix
  private clientService: ClientService
  private configurationManager: ConfigurationManager
  private store: Store<any>
  private updateAccessTokenPromise: Promise<void> | null

  constructor(options: UserManagerOptions) {
    const storePrefix = 'oc_oAuth.'
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

    if (options.configurationManager.isOIDC) {
      Object.assign(openIdConfig, {
        scope: 'openid profile offline_access',
        loadUserInfo: true,
        ...options.configurationManager.oidc
      })
    } else if (options.configurationManager.isOAuth2) {
      const oAuth2 = options.configurationManager.oAuth2
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
    this.clientService = options.clientService
    this.configurationManager = options.configurationManager
    this.store = options.store
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

  getAndClearPostLoginRedirectUrl(): string {
    const url = sessionStorage.getItem(postLoginRedirectUrlKey) || '/'
    sessionStorage.removeItem(postLoginRedirectUrlKey)
    return url
  }

  setPostLoginRedirectUrl(url?: string): void {
    if (url) {
      sessionStorage.setItem(postLoginRedirectUrlKey, url)
    } else {
      sessionStorage.removeItem(postLoginRedirectUrlKey)
    }
  }

  updateContext(accessToken: string): Promise<void> {
    const userKnown = !!this.store.getters.user.id
    const accessTokenChanged = this.store.getters['runtime/auth/accessToken'] !== accessToken
    if (!accessTokenChanged) {
      return this.updateAccessTokenPromise
    }
    this.store.commit('runtime/auth/SET_ACCESS_TOKEN', accessToken)

    this.updateAccessTokenPromise = (async () => {
      this.initializeOwnCloudSdk(accessToken)

      if (!userKnown) {
        await this.fetchUserInfo(accessToken)
        this.store.commit('runtime/auth/SET_USER_CONTEXT_READY', true)
      }
    })()
    return this.updateAccessTokenPromise
  }

  private initializeOwnCloudSdk(accessToken): void {
    const options = {
      baseUrl: this.configurationManager.serverUrl,
      auth: {
        bearer: accessToken
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
    if (this.store.getters.user.id) {
      ;(options as any).userInfo = {
        id: this.store.getters.user.id,
        'display-name': this.store.getters.user.displayname,
        email: this.store.getters.user.email
      }
    }

    this.clientService.owncloudSdk.init(options)
  }

  private async fetchUserInfo(accessToken): Promise<void> {
    const login = await this.clientService.owncloudSdk.getCurrentUser()
    await this.fetchCapabilities({ accessToken })

    // FIXME: Can be removed as soon as the uuid is integrated in the OCS api
    // see https://github.com/owncloud/ocis/issues/3271
    let graphUser
    if (this.store.getters.capabilities.spaces?.enabled) {
      const graphClient = this.clientService.graphAuthenticated(
        this.configurationManager.serverUrl,
        accessToken
      )
      graphUser = await graphClient.users.getMe()
    }
    const [user, userGroups] = await Promise.all([
      await this.clientService.owncloudSdk.users.getUser(login.id),
      await this.clientService.owncloudSdk.users.getUserGroups(login.id)
    ])
    this.store.commit('SET_USER', {
      id: login.id,
      uuid: graphUser?.data?.id || '',
      username: login.username || login.id,
      displayname: user.displayname || login['display-name'],
      email: login?.email || user?.email || '',
      groups: userGroups,
      language: login?.language,
      ...(user.quota &&
        user.quota.definition !== 'default' &&
        user.quota.definition !== 'none' && { quota: user.quota })
    })

    await this.store.dispatch('loadSettingsValues')
  }

  private async fetchCapabilities({ accessToken = '' }): Promise<void> {
    if (!isEmpty(this.store.getters.capabilities)) {
      return
    }

    const client = this.clientService.ocsUserContext(
      this.configurationManager.serverUrl,
      accessToken
    )
    const capabilities = await client.getCapabilities()

    this.store.commit('SET_CAPABILITIES', capabilities)
  }
}
