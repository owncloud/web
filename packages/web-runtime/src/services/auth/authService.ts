import { UserManager } from './userManager'
import { Store } from 'vuex'
import { clientService, ClientService } from 'web-pkg/src/services'
import { ConfigurationManager } from 'web-pkg/src/configuration'
import { router } from '../../router'
import isEmpty from 'lodash-es/isEmpty'
import get from 'lodash-es/get'
import VueRouter from 'vue-router'

export class AuthService {
  private configurationManager: ConfigurationManager
  private userManager: UserManager
  private clientService: ClientService
  private store: Store<any>
  private router: VueRouter

  public async initialize(
    configurationManager: ConfigurationManager,
    clientService: ClientService,
    store: Store<any>,
    router: VueRouter
  ): Promise<void> {
    this.configurationManager = configurationManager
    this.clientService = clientService
    this.store = store
    this.router = router
  }

  public async initializeUserManager() {
    this.userManager = new UserManager(this.configurationManager)
    this.userManager.events.addAccessTokenExpired((...args) => {
      console.log('AccessToken Expired：', ...args)
    })
    this.userManager.events.addAccessTokenExpiring((...args) => {
      console.log('AccessToken Expiring：', ...args)
    })

    ;(this as any).getUserPromise = new Promise(async (resolve, reject) => {
      const user = await this.userManager.getUser()
      if(user !== null) {
        resolve(user)
      }

      this.userManager.events.addUserLoaded(async (user) => {
        console.log(
          `New User Loaded. access_token： ${user.access_token}, refresh_token: ${user.refresh_token}`
        )
        await this.updateAccessToken(user.access_token, false)
        resolve(user)
      })
    })

    this.userManager.events.addUserLoaded(async (user) => {
      console.log(
        `New User Loaded. access_token： ${user.access_token}, refresh_token: ${user.refresh_token}`
      )
      await this.updateAccessToken(user.access_token, false)
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
        } else if (this.configurationManager.serverUrl) {
          return (window.location =
            `${this.configurationManager.serverUrl}/index.php/logout` as any)
        }
      }
      return this.router.push({ name: 'login' })
    })
    this.userManager.events.addSilentRenewError(async (error) => {
      console.error('Silent Renew Error：', error)
      await this.resetStateAfterLogout()
      await this.router.push({ name: 'accessDenied' })
    })

    const accessToken = this.userManager.getAccessToken()
    if (accessToken) {
      await this.updateAccessToken(accessToken, true)
      console.log(this.store.getters.user)
    }
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

  public login() {
    return this.userManager.signinRedirect()
  }

  public async signInCallback() {
    // craft a url that the parser in oidc-client-ts can handle …
    // oidc-client-ts > 2.0.4 should accept relative urls as well. Until we have that we prepend our current origin
    const url =
      window.location.origin +
      '/?' +
      new URLSearchParams(router.currentRoute.query as Record<string, string>).toString()

    try {
      await this.userManager.signinRedirectCallback(url)

      // might be the case that we didn't have an access token before, so we need to (re-)fetch all user info.
      const accessToken = this.userManager.getAccessToken()
      await this.updateAccessToken(accessToken, true)

      // FIXME: don't we want to go back to the route from before the login?! and NEVER to `/`?!
      // if the IDP doesn't provide a refresh token we currently land here. which leads to a hard redirect to `/` on any access token expiry. BAD.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      router.push({ path: '/' }).catch(() => {})
    } catch (e) {
      console.warn('error in OpenIdConnect:', e)
      await this.resetStateAfterLogout()
      return router.push({ name: 'accessDenied' })
    }
  }

  public async signInSilentCallback() {
    await this.userManager.signinSilentCallback()

    // silent callback implies that we had a valid access token before. Not needed to re-fetch all user info.
    const accessToken = this.userManager.getAccessToken()
    await this.updateAccessToken(accessToken, false)
  }

  private async updateAccessToken(accessToken: string, fetchUserInfo: boolean): Promise<void> {
    this.initializeOwnCloudSdk(accessToken)
    if (fetchUserInfo) {
      await this.fetchUserInfo(accessToken)
    } else {
      // TODO: discuss if we want to cache the accessToken in the store or otherwise.
      // The userManager already holds the accessToken, but querying it is rather expensive.
      this.store.commit('SET_ACCESS_TOKEN', accessToken)
    }
    this.triggerUserReady()
  }

  private async fetchUserInfo(accessToken): Promise<void> {
    let login
    try {
      login = await this.clientService.owncloudSdk.login()
    } catch (e) {
      console.warn('Seems that your token is invalid. Error:', e)
      await this.resetStateAfterLogout()
      await router.replace({ name: 'accessDenied' })
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
    const u = this.userManager.getStoredUserObject()
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
