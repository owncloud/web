import { Log, User, UserManager, WebStorageStateStore } from 'oidc-client'

export function initVueAuthenticate (config) {
  if (config) {
    const store = new WebStorageStateStore({
      prefix: 'oc_oAuth'
    })
    let baseUrl = window.location.href.split('#')[0]
    if (baseUrl.endsWith('/index.html')) {
      baseUrl = baseUrl.substr(0, baseUrl.length - 10)
    }
    let openIdConfig = {
      userStore: store,
      redirect_uri: baseUrl + 'oidc-callback.html',
      response_type: 'code', // code triggers auth code grant flow
      response_mode: 'query',
      scope: 'openid profile offline_access',
      monitorSession: false,
      post_logout_redirect_uri: baseUrl,
      silent_redirect_uri: baseUrl + 'oidc-silent-redirect.html',
      accessTokenExpiringNotificationTime: 10,
      automaticSilentRenew: false,
      filterProtocolClaims: true,
      loadUserInfo: true
    }
    if (config.openIdConnect && config.openIdConnect.authority) {
      Object.assign(openIdConfig, config.openIdConnect)
    } else {
      // old openidconnect setup
      if (config.auth.metaDataUrl) {
        Object.assign(openIdConfig, {
          authority: config.auth.url,
          metadataUrl: config.auth.metaDataUrl,
          client_id: config.auth.clientId
        })
      } else {
        // oauth2 setup
        Object.assign(openIdConfig, {
          authority: config.auth.url,
          // with OAuth2 we need to se the metadata manually
          metadata: {
            issuer: config.auth.url,
            authorization_endpoint: config.auth.authUrl,
            token_endpoint: config.auth.url,
            userinfo_endpoint: ''
          },
          client_id: config.auth.clientId,
          response_type: 'token', // token is implicit flow - to be killed
          scope: 'openid profile',
          loadUserInfo: false
        })
      }
    }

    let mgr = new UserManager(openIdConfig)

    Log.logger = console

    mgr.events.addUserLoaded(function (user) {
      console.log('New User Loaded：', arguments)
      console.log('Access_token: ', user.access_token)
    })

    mgr.events.addSilentRenewError(function () {
      console.error('Silent Renew Error：', arguments)
    })

    mgr.events.addUserSignedOut(function () {
      console.log('UserSignedOut：', arguments)
    })

    return {
      authenticate () {
        return mgr.signinRedirect()
      },
      getToken () {
        let storageString = localStorage.getItem('oc_oAuth' + mgr._userStoreKey)
        if (storageString) {
          let user = User.fromStorageString(storageString)
          if (user) {
            mgr.events.load(user, false)
            return user.access_token
          }
        }
        return null
      },
      isAuthenticated () {
        return this.getToken() !== null
      },
      logout () {
        mgr.removeUser()
      },
      mgr: mgr,
      events () {
        return mgr.events
      }
    }
  }
}

export default initVueAuthenticate
