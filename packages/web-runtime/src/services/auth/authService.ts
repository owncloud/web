import { UserManager } from './userManager'
import { Store } from 'vuex'
import { clientService, ClientService } from 'web-pkg/src/services'
import { ConfigurationManager } from 'web-pkg/src/configuration'
import isEmpty from 'lodash-es/isEmpty'
import get from 'lodash-es/get'
import VueRouter from 'vue-router'

const postLoginRedirectUrlKey = 'postLoginRedirectUrl'

export class AuthService {
  private configurationManager: ConfigurationManager
  private userManager: UserManager
  private clientService: ClientService
  private store: Store<any>
  private router: VueRouter
  private updateAccessTokenPromise: Promise<void> | null

  public initialize(
    configurationManager: ConfigurationManager,
    clientService: ClientService,
    store: Store<any>,
    router: VueRouter
  ): void {
    this.configurationManager = configurationManager
    this.clientService = clientService
    this.store = store
    this.router = router
  }

  public async initializeContext() {
    if (!this.userManager) {
      this.userManager = new UserManager(this.configurationManager)
      this.userManager.events.addAccessTokenExpired((...args) => {
        console.log('AccessToken Expired：', ...args)
        // TODO: we want to log out the user here because token refresh failed.
      })
      this.userManager.events.addAccessTokenExpiring((...args) => {
        console.log('AccessToken Expiring：', ...args)
      })
      this.userManager.events.addUserLoaded(async (user) => {
        console.log(
          `New User Loaded. access_token： ${user.access_token}, refresh_token: ${user.refresh_token}`
        )
        await this.updateUserContext(user.access_token)
      })
      this.userManager.events.addUserSignedIn(() => {
        console.log('user signed in')
      })
      this.userManager.events.addUserUnloaded(async () => {
        console.log('user unloaded…')
        await this.resetStateAfterLogout()

        // handle redirect after logout
        if (this.configurationManager.isOAuth2) {
          const oAuth2 = this.configurationManager.oAuth2
          if (oAuth2.logoutUrl) {
            return (window.location = oAuth2.logoutUrl as any)
          }
          return (window.location =
            `${this.configurationManager.serverUrl}/index.php/logout` as any)
        }
      })
      this.userManager.events.addSilentRenewError(async (error) => {
        console.error('Silent Renew Error：', error)
        await this.resetStateAfterLogout()
        await this.router.push({ name: 'accessDenied' })
      })
    }

    // relevant for page reload: token is already in userStore
    // no userLoaded event and no signInCallback gets triggered
    console.time('userManager.initialize: getAccessToken')
    const accessToken = await this.userManager.getAccessToken()
    console.timeEnd('userManager.initialize: getAccessToken')
    if (accessToken) {
      console.time('userManager.initialize: updateAccessToken')
      await this.updateUserContext(accessToken)
      console.timeEnd('userManager.initialize: updateAccessToken')
    }

    // TODO: similar to the user context update above, we also need a public link context update.
    // const publicLinkToken = <where to get the public link token from?!>
    // if (publicLinkToken) {
    //   const publicLinkPassword = <where to get the public link password from?!>
    //   await this.updatePublicLinkContext(publicLinkToken, publicLinkPassword)
    // }
  }

  public login(redirectUrl?: string) {
    sessionStorage.setItem(postLoginRedirectUrlKey, redirectUrl)
    return this.userManager.signinRedirect()
  }

  /**
   * Sign in callback gets called from the IDP after initial login.
   */
  public async signInCallback() {
    // craft a url that the parser in oidc-client-ts can handle… this is required for oauth2 logins
    const url =
      '/?' +
      new URLSearchParams(this.router.currentRoute.query as Record<string, string>).toString()

    try {
      await this.userManager.signinRedirectCallback(url)

      const redirectUrl = sessionStorage.getItem(postLoginRedirectUrlKey) || '/'
      sessionStorage.removeItem(postLoginRedirectUrlKey)
      return this.router.push({ path: redirectUrl })
    } catch (e) {
      console.warn('error during authentication:', e)
      await this.resetStateAfterLogout()
      return this.router.push({ name: 'accessDenied' })
    }
  }

  /**
   * Sign in silent callback gets called with OIDC during access token renewal when no `refresh_token`
   * is present (`refresh_token` exists when `offline_access` is present in scopes).
   *
   * The oidc-client lib emits a userLoaded event internally, which already handles the token update
   * in web.
   */
  public async signInSilentCallback() {
    await this.userManager.signinSilentCallback()
  }

  private updateUserContext(accessToken: string): Promise<void> {
    const userKnown = !!this.store.getters.user.id
    const accessTokenChanged = this.store.getters['runtime/auth/accessToken'] !== accessToken
    if (!accessTokenChanged) {
      return this.updateAccessTokenPromise
    }
    this.store.commit('runtime/auth/SET_USER_CONTEXT', { accessToken })
    // TODO: SET_ACCESS_TOKEN is deprecated and will be removed soonish
    this.store.commit('SET_ACCESS_TOKEN', accessToken)

    this.updateAccessTokenPromise = (async () => {
      this.initializeOwnCloudSdk(accessToken)

      if (!userKnown) {
        await this.fetchUserInfo(accessToken)
        this.triggerUserReady()
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
    let login
    try {
      login = await this.clientService.owncloudSdk.login()
    } catch (e) {
      console.warn('Seems that your token is invalid. Error:', e)
      await this.resetStateAfterLogout()
      await this.router.replace({ name: 'accessDenied' })
      return
    }

    const [capabilities, userGroups, user] = await Promise.all([
      this.clientService.owncloudSdk.getCapabilities(false),
      this.clientService.owncloudSdk.users.getUserGroups(login.id),
      this.clientService.owncloudSdk.users.getUser(login.id)
    ])
    this.store.commit('SET_CAPABILITIES', capabilities)

    // FIXME: Can be removed as soon as the uuid is integrated in the OCS api
    // see https://github.com/owncloud/ocis/issues/3271
    let graphUser
    if (this.store.getters.capabilities.spaces?.enabled) {
      const graphClient = clientService.graphAuthenticated(
        this.configurationManager.serverUrl,
        accessToken
      )
      graphUser = await graphClient.users.getMe()
    }

    let userEmail = ''
    if (login && login.email) {
      userEmail = login.email
    } else if (user && user.email) {
      userEmail = user.email
    }

    const language = user?.language
    this.store.commit('SET_USER', {
      id: login.id,
      uuid: graphUser?.data?.id || '',
      username: login.username,
      displayname: login.displayname || login['display-name'],
      email: userEmail,
      token: accessToken,
      isAuthenticated: true,
      groups: userGroups,
      language,
      ...(user.quota.definition !== 'default' &&
        user.quota.definition !== 'none' && { quota: user.quota })
    })
    this.store.commit('runtime/auth/SET_USER_CONTEXT', {
      accessToken,
      userContextReady: true
    })

    await this.store.dispatch('loadSettingsValues')
  }

  public async fetchCapabilities({
    accessToken = '',
    publicToken = '',
    user = '',
    password = '',
    overwrite = false
  }): Promise<void> {
    if (!isEmpty(this.store.getters.capabilities) && !overwrite) {
      return
    }

    const endpoint = new URL(this.configurationManager.serverUrl)
    endpoint.pathname = endpoint.pathname.replace(/\/$/, '') + '/ocs/v1.php/cloud/capabilities'
    endpoint.searchParams.append('format', 'json')

    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      ...(publicToken && { 'public-token': publicToken }),
      ...(user &&
        password && {
          Authorization: 'Basic ' + Buffer.from([user, password].join(':')).toString('base64')
        }),
      ...(accessToken && {
        Authorization: 'Bearer ' + accessToken
      })
    }

    const capabilitiesApiResponse = await fetch(endpoint.href, { headers })
    const capabilitiesApiResponseJson = await capabilitiesApiResponse.json()

    this.store.commit(
      'SET_CAPABILITIES',
      get(capabilitiesApiResponseJson, 'ocs.data', { capabilities: null, version: null })
    )
  }

  private triggerUserReady(): void {
    // TODO: we can get rid of the user ready hook when the authLogic is properly blocking. Until then we need it...
    this.store.commit('SET_USER_READY', true)
  }

  public async logout() {
    const u = await this.userManager.getUser()
    if (u && u.id_token) {
      return this.userManager.signoutRedirect({ id_token_hint: u.id_token })
    } else {
      await this.userManager.removeUser()
    }
  }

  private async resetStateAfterLogout() {
    // TODO: create UserUnloadTask interface and allow registering unload-tasks in the authService
    await this.store.dispatch('resetUserState')
    await Promise.all([
      this.store.dispatch('clearDynamicNavItems'),
      this.store.dispatch('hideModal'),
      this.store.dispatch('clearSettingsValues')
    ])
  }
}

export const authService = new AuthService()
