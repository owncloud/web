import Axios from 'axios'
import { VueAuthenticate } from 'vue-authenticate'

const vueAuthInstance = new VueAuthenticate(Axios, {
  providers: {
    oauth2: {
      name: 'ownCloud',
      clientId: 'oYrkjUIfkDv8kZsz5P5GSvRnn0Stk7U7lUL5cfKJd0re9gMp29qz7DHqvPfq1KBb',
      clientSecret: 'G7oVHQZrMjCADrKMJtn0U2JXHx1NdMbPiWvEyV8ocRbNyafvoa5c4OKC7hDPJytR',
      url: 'http://deepdiver:8080/index.php/apps/oauth2/api/v1/token',
      authorizationEndpoint: 'http://deepdiver:8080/index.php/apps/oauth2/authorize',
      responseParams: {
        code: 'code',
        clientId: 'client_id',
        redirectUri: 'redirect_uri',
        grantType: 'grant_type'
      }

    }
  }
})

export default vueAuthInstance
