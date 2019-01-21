import { Log, User, UserManager, WebStorageStateStore } from 'oidc-client'
import 'babel-polyfill'

export function initVueAuthenticate (config) {
  if (config) {
    const store = new WebStorageStateStore({
      prefix: 'oc_oAuth'
    })
    let mgr = new UserManager({
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
      redirect_uri: window.location.href,
      response_type: 'token', // token is implicit flow - to be killed
      // response_type: 'code', // for authentication code flow use 'code
      // response_type: 'id_token token', // this should enable OpenID Connect - to be tested
      response_mode: 'query',
      scope: 'openid profile',
      post_logout_redirect_uri: window.location.origin + '/index.html',
      silent_redirect_uri: window.location.origin + '/static/silent-renew.html',
      accessTokenExpiringNotificationTime: 10,
      automaticSilentRenew: true,
      filterProtocolClaims: true,
      loadUserInfo: true
    })

    Log.logger = console
    Log.level = Log.DEBUG

    mgr.events.addUserLoaded(function (user) {
      console.log('New User Loaded：', arguments)
      console.log('Access_token: ', user.access_token)
    })

    mgr.events.addAccessTokenExpiring(function () {
      console.log('AccessToken Expiring：', arguments)
    })

    mgr.events.addAccessTokenExpired(function () {
      console.log('AccessToken Expired：', arguments)
      alert('Session expired. Going out!')
      mgr.signoutRedirect().then(function (resp) {
        console.log('signed out', resp)
      }).catch(function (err) {
        console.log(err)
      })
    })

    mgr.events.addSilentRenewError(function () {
      console.error('Silent Renew Error：', arguments)
    })

    mgr.events.addUserSignedOut(function () {
      alert('Going out!')
      console.log('UserSignedOut：', arguments)
      mgr.signoutRedirect().then(function (resp) {
        console.log('signed out', resp)
      }).catch(function (err) {
        console.log(err)
      })
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
      authCallback () {
        return mgr.signinRedirectCallback()
      }
    }

  //   return new VueAuthenticate(Axios, {
  //     tokenPrefix: 'oc_oAuth',
  //     providers: {
  //       oauth2: {
  //         name: 'ownCloud',
  //         clientId: config.clientId,
  //         url: config.apiUrl,
  //         authorizationEndpoint: config.authUrl,
  //         redirectUri: window.location.href,
  //         responseType: 'token',
  //         responseParams: {
  //           code: 'code',
  //           clientId: 'client_id',
  //           redirectUri: 'redirect_uri'
  //         },
  //         // below is used for open id connect
  //         scope: ['profile', 'email'],
  //         scopePrefix: 'openid',
  //         scopeDelimiter: ' ',
  //         requiredUrlParams: ['scope']
  //       }
  //     }
  //   })
  }
}

export default initVueAuthenticate
