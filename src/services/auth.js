import { Log, User, UserManager, WebStorageStateStore } from 'oidc-client'

export function initVueAuthenticate (config) {
  if (config) {
    const store = new WebStorageStateStore({
      prefix: 'oc_oAuth'
    })
    let mgr
    let baseUrl = window.location.href.split('#')[0]
    if (baseUrl.endsWith('/index.html')) {
      baseUrl = baseUrl.substr(0, baseUrl.length - 10)
    }
    if (config.metaDataUrl) {
      mgr = new UserManager({
        userStore: store,
        authority: config.url,
        metadataUrl: config.metaDataUrl,
        client_id: config.clientId,
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
      })
    } else {
      mgr = new UserManager({
        userStore: store,
        authority: config.url,
        // with OAuth2 we need to se the metadata manually
        metadata: {
          issuer: config.url,
          authorization_endpoint: config.authUrl,
          token_endpoint: config.url,
          userinfo_endpoint: ''
        },
        client_id: config.clientId,
        redirect_uri: baseUrl + 'oidc-callback.html',
        response_type: 'token', // token is implicit flow - to be killed
        // response_type: 'code', // for authentication code flow use 'code
        response_mode: 'query',
        scope: 'openid profile',
        monitorSession: false,
        accessTokenExpiringNotificationTime: 10,
        automaticSilentRenew: false,
        filterProtocolClaims: true,
        loadUserInfo: false
      })
    }

    Log.logger = console
    Log.level = Log.DEBUG

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
