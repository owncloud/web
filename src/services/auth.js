import Axios  from 'axios';
import { VueAuthenticate } from 'vue-authenticate'

const vueAuthInstance = new VueAuthenticate(Axios, {
    providers: {
        oauth2: {
            name: 'ownCloud',
            clientId: 'Cxfj9F9ZZWQbQZps1E1M0BszMz6OOFq3lxjSuc8Uh4HLEYb9KIfyRMmgY5ibXXrU',
            url: 'http://deepdiver:8080/index.php/apps/oauth2/api/v1/token',
            authorizationEndpoint: 'http://deepdiver:8080/index.php/apps/oauth2/authorize',
            responseType: 'token',
            responseParams: {
                code: 'code',
                clientId: 'client_id',
                redirectUri: 'redirect_uri'
            }

        }
    }
});

export default vueAuthInstance
