import {
  Log,
  WebStorageStateStore,
  UserManager as OidcUserManager,
  UserManagerSettings,
  User,
  ErrorResponse,
  JwtClaims
} from 'oidc-client-ts'
import jwt_decode from "jwt-decode";
import { buildUrl } from '../../router'
import { ConfigurationManager } from 'web-pkg/src/configuration'
import { ClientService } from 'web-pkg/src/services'
import { Store } from 'vuex'
import isEmpty from 'lodash-es/isEmpty'
import axios from 'axios'
import { v4 as uuidV4 } from 'uuid'

const postLoginRedirectUrlKey = 'oc.postLoginRedirectUrl'
type UnloadReason = 'authError' | 'logout'

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
  private _unloadReason: UnloadReason

  constructor(options: UserManagerOptions) {
    const storePrefix = 'oc_oAuth.'
    const userStore = new WebStorageStateStore({
      prefix: storePrefix,
      store: localStorage
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
        scope: 'openid profile',
        loadUserInfo: true,
        ...options.configurationManager.oidc
      })
    } else if (options.configurationManager.isOAuth2) {
      const oAuth2 = options.configurationManager.oAuth2
      Object.assign(openIdConfig, {
        authority: oAuth2.url,
        client_id: oAuth2.clientId,
        ...(oAuth2.clientSecret && {
          client_authentication: 'client_secret_basic',
          client_secret: oAuth2.clientSecret
        }),

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

    Log.setLogger(console)
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

  async removeUser(unloadReason: UnloadReason = 'logout') {
    this._unloadReason = unloadReason
    await super.removeUser()
  }

  get unloadReason(): UnloadReason {
    return this._unloadReason
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
    const [login] = await Promise.all([
      this.clientService.owncloudSdk.getCurrentUser(),
      this.fetchCapabilities({ accessToken })
    ])

    let role, graphUser, userGroups

    // start the network request here and let it run in parallel to the next calls,
    // until awaiting the promise execution further below
    const userPromise = this.clientService.owncloudSdk.users.getUser(login.id)

    if (this.store.getters.capabilities.spaces?.enabled) {
      const graphClient = this.clientService.graphAuthenticated(
        this.configurationManager.serverUrl,
        accessToken
      )
      let roles, settings
      ;[graphUser, roles, settings] = await Promise.all([
        graphClient.users.getMe(),
        this.fetchRoles({ accessToken }),
        this.fetchSettings()
      ])
      this.store.commit('SET_ROLES', roles)
      this.store.commit('SET_SETTINGS_VALUES', settings)

      role = await this.fetchRole({ graphUser, accessToken, roles })
    } else {
      userGroups = await this.clientService.owncloudSdk.users.getUserGroups(login.id)
    }

    const user = await userPromise

    this.store.commit('SET_USER', {
      id: login.id,
      uuid: graphUser?.data?.id || '',
      username: login.username || login.id,
      displayname: user.displayname || login['display-name'],
      email: login?.email || user?.email || '',
      groups: graphUser?.data?.memberOf || userGroups || [],
      isLightweight: ['federated', 'lightweight'].includes(user['user-type']),
      role,
      language: login?.language
    })

    if (!this.store.getters.capabilities.spaces?.enabled && user.quota) {
      this.store.commit('SET_QUOTA', user.quota)
    }
  }

  private async fetchRoles({ accessToken = '' }): Promise<any> {
    try {
      const {
        data: { bundles: roles }
      } = await axios.post(
        '/api/v0/settings/roles-list',
        {},
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
            'X-Request-ID': uuidV4()
          }
        }
      )
      return roles
    } catch (e) {
      console.error(e)
      return []
    }
  }

  private async fetchSettings(): Promise<any> {
    try {
      return await this.clientService.owncloudSdk.settings.getSettingsValues()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  private async fetchRole({ graphUser, accessToken, roles }): Promise<any> {
    const userAssignmentResponse = await axios.post(
      '/api/v0/settings/assignments-list',
      {
        account_uuid: graphUser.data.id
      },
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
          'X-Request-ID': uuidV4()
        }
      }
    )
    const assignments = userAssignmentResponse.data?.assignments
    const roleAssignment = assignments.find((assignment) => 'roleId' in assignment)
    return roleAssignment ? roles.find((role) => role.id === roleAssignment.roleId) : null
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

  // Copied from upstream oidc-client-ts UserManager with a personalisation
  protected async _signinEnd(url: string, verifySub?: string): Promise<User> {
    const logger = this._logger.create('_signinEnd')
    const signinResponse = await this._client.processSigninResponse(url)
    logger.debug('got signin response')

    const user = new User(signinResponse)
    if (verifySub) {
      if (verifySub !== user.profile.sub) {
        logger.debug(
          'current user does not match user returned from signin. sub from signin:',
          user.profile.sub
        )
        throw new ErrorResponse({ ...signinResponse, error: 'login_required' })
      }
      logger.debug('current user matches user returned from signin')
    }

    /* CERNBox personalisation
      Do a call to the backend, as this will reply with the internal reva token.
      Use that longer token in all calls to the backend (so, replace the default store token)
    */
    try {
      console.log('CERNBox: loging successful, exchange sso token with reva token')
      const revaTokenReq = await axios.get('/ocs/v1.php/cloud/user', {
        headers: {
          Authorization: 'Bearer ' + user.access_token
        }
      })
      const revaToken = revaTokenReq.headers['x-access-token']
      const claims = jwt_decode<JwtClaims>(revaToken)
      user.access_token = revaToken
      user.expires_at = claims.exp
    } catch (e) {
      console.error('Failed to get reva token, continue with sso one', e)
    }
    // end

    await this.storeUser(user)
    logger.debug('user stored')
    this._events.load(user)

    return user
  }
}
