import {
  Log,
  WebStorageStateStore,
  UserManager as OidcUserManager,
  UserManagerSettings,
  User,
  ErrorResponse
} from 'oidc-client-ts'
import { buildUrl } from '@ownclouders/web-pkg/src/helpers/router/buildUrl'
import { getAbilities } from './abilities'
import { ConfigurationManager } from '@ownclouders/web-pkg'
import { ClientService } from '@ownclouders/web-pkg'
import { Store } from 'vuex'
import isEmpty from 'lodash-es/isEmpty'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { Language } from 'vue3-gettext'
import { setCurrentLanguage } from 'web-runtime/src/helpers/language'
import { router } from 'web-runtime/src/router'
import { SSEAdapter } from '@ownclouders/web-client/src/sse'

const postLoginRedirectUrlKey = 'oc.postLoginRedirectUrl'
type UnloadReason = 'authError' | 'logout'

export interface UserManagerOptions {
  clientService: ClientService
  configurationManager: ConfigurationManager
  store: Store<any>
  ability: Ability
  language: Language
}

export class UserManager extends OidcUserManager {
  private readonly storePrefix
  private clientService: ClientService
  private configurationManager: ConfigurationManager
  private store: Store<any>
  private updateAccessTokenPromise: Promise<void> | null
  private _unloadReason: UnloadReason
  private ability: Ability
  private language: Language
  private browserStorage: Storage
  public areEventHandlersRegistered: boolean

  constructor(options: UserManagerOptions) {
    const browserStorage = options.configurationManager.options.tokenStorageLocal
      ? localStorage
      : sessionStorage
    const storePrefix = 'oc_oAuth.'
    const userStore = new WebStorageStateStore({
      prefix: storePrefix,
      store: browserStorage
    })
    const openIdConfig: UserManagerSettings = {
      userStore,
      redirect_uri: buildUrl(router, '/oidc-callback.html'),
      silent_redirect_uri: buildUrl(router, '/oidc-silent-redirect.html'),

      response_mode: 'query',
      response_type: 'code', // "code" triggers auth code grant flow

      post_logout_redirect_uri: buildUrl(router, '/'),
      accessTokenExpiringNotificationTimeInSeconds: 10,
      authority: '',
      client_id: '',

      automaticSilentRenew: options.configurationManager.options.embed?.enabled
        ? !options.configurationManager.options.embed.delegateAuthentication
        : true
    }

    if (options.configurationManager.isOIDC) {
      Object.assign(openIdConfig, {
        scope: 'openid profile',
        loadUserInfo: false,
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
    this.browserStorage = browserStorage
    this.clientService = options.clientService
    this.configurationManager = options.configurationManager
    this.store = options.store
    this.ability = options.ability
    this.language = options.language
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
    const url = this.browserStorage.getItem(postLoginRedirectUrlKey) || '/'
    this.browserStorage.removeItem(postLoginRedirectUrlKey)
    return url
  }

  setPostLoginRedirectUrl(url?: string): void {
    if (url) {
      this.browserStorage.setItem(postLoginRedirectUrlKey, url)
    } else {
      this.browserStorage.removeItem(postLoginRedirectUrlKey)
    }
  }

  updateContext(accessToken: string, fetchUserData: boolean): Promise<void> {
    const userKnown = !!this.store.getters.user.id
    const accessTokenChanged = this.store.getters['runtime/auth/accessToken'] !== accessToken
    if (!accessTokenChanged) {
      return this.updateAccessTokenPromise
    }

    this.store.commit('runtime/auth/SET_ACCESS_TOKEN', accessToken)

    this.updateAccessTokenPromise = (async () => {
      if (!fetchUserData) {
        this.store.commit('runtime/auth/SET_IDP_CONTEXT_READY', true)
        return
      }

      this.initializeOwnCloudSdk(accessToken)

      if (this.store.getters.capabilities?.core?.['support-sse']) {
        ;(this.clientService.sseAuthenticated as SSEAdapter).updateAccessToken(accessToken)
      }

      if (!userKnown) {
        await this.fetchUserInfo(accessToken)
        await this.updateUserAbilities(this.store.getters.user)
        this.store.commit('runtime/auth/SET_USER_CONTEXT_READY', true)
      }
    })()
    return this.updateAccessTokenPromise
  }

  private initializeOwnCloudSdk(accessToken: string): void {
    const options = {
      baseUrl: this.configurationManager.serverUrl,
      auth: {
        bearer: accessToken
      },
      headers: {
        'Accept-Language': this.language.current
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

  private async fetchUserInfo(accessToken: string): Promise<void> {
    const [login] = await Promise.all([
      this.clientService.owncloudSdk.getCurrentUser(),
      this.fetchCapabilities()
    ])

    let role, graphUser, userGroups

    // start the network request here and let it run in parallel to the next calls,
    // until awaiting the promise execution further below
    const userPromise = this.clientService.owncloudSdk.users.getUser(login.id)

    if (this.store.getters.capabilities.spaces?.enabled) {
      const graphClient = this.clientService.graphAuthenticated
      let roles
      ;[graphUser, roles] = await Promise.all([graphClient.users.getMe(), this.fetchRoles()])
      this.store.commit('SET_ROLES', roles)

      role = await this.fetchRole({ graphUser, roles })
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
      role,
      language: graphUser?.data?.preferredLanguage || ''
    })

    if (graphUser?.data?.preferredLanguage) {
      setCurrentLanguage({
        language: this.language,
        languageSetting: graphUser.data.preferredLanguage
      })
      this.initializeOwnCloudSdk(accessToken)
    }

    if (!this.store.getters.capabilities.spaces?.enabled && user.quota) {
      this.store.commit('SET_QUOTA', user.quota)
    }
  }

  private async fetchRoles(): Promise<any> {
    const httpClient = this.clientService.httpAuthenticated
    try {
      const {
        data: { bundles: roles }
      } = await httpClient.post('/api/v0/settings/roles-list', {})
      return roles
    } catch (e) {
      console.error(e)
      return []
    }
  }

  private async fetchRole({ graphUser, roles }): Promise<any> {
    const httpClient = this.clientService.httpAuthenticated
    const userAssignmentResponse = await httpClient.post('/api/v0/settings/assignments-list', {
      account_uuid: graphUser.data.id
    })
    const assignments = userAssignmentResponse.data?.assignments
    const roleAssignment = assignments.find((assignment) => 'roleId' in assignment)
    return roleAssignment ? roles.find((role) => role.id === roleAssignment.roleId) : null
  }

  private async fetchCapabilities(): Promise<void> {
    if (!isEmpty(this.store.getters.capabilities)) {
      return
    }

    const capabilities = await this.clientService.ocsUserContext.getCapabilities()

    this.store.commit('SET_CAPABILITIES', capabilities)
  }

  // copied from upstream oidc-client-ts UserManager with CERN customization
  protected async _signinEnd(url: string, verifySub?: string, ...args): Promise<User> {
    if (!this.configurationManager.options.isRunningOnEos) {
      return (super._signinEnd as any)(url, verifySub, ...args)
    }

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

    /* CERNBox customization
     * Do a call to the backend, as this will reply with the internal reva token.
     * Use that longer token in all calls to the backend (so, replace the default store token)
     */
    try {
      console.log('CERNBox: login successful, exchange sso token with reva token')
      const httpClient = this.clientService.httpAuthenticated
      const revaTokenReq = await httpClient.get('/ocs/v1.php/cloud/user')
      const revaToken = revaTokenReq.headers['x-access-token']
      const claims = JSON.parse(atob(revaToken.split('.')[1]))
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

  private async fetchPermissions({ user }): Promise<any> {
    const httpClient = this.clientService.httpAuthenticated
    const oC10DefaultPermissions = ['PublicLink.Write.all']
    try {
      const {
        data: { permissions }
      } = await httpClient.post('/api/v0/settings/permissions-list', { account_uuid: user.uuid })
      return permissions || oC10DefaultPermissions
    } catch (e) {
      console.error(e)
      return oC10DefaultPermissions
    }
  }

  private async updateUserAbilities(user) {
    const permissions = await this.fetchPermissions({ user })
    const abilities = getAbilities(permissions)
    this.ability.update(abilities)
  }
}
