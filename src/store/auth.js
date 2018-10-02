import vueAuthInstance from '../services/auth.js'

export default {
    state: {
        user: {
            displayname: '',
            email: 'x'
        },
        isAuthenticated: vueAuthInstance.isAuthenticated()
    },

    mutations: {
        isAuthenticated (state, payload) {
            state.isAuthenticated = payload.isAuthenticated;
        },
        setUser (state, payload) {
            state.user = payload;
        }
    },

    actions: {
        login (context, payload) {
            payload = payload || {}
            return vueAuthInstance.login(payload.user, payload.requestOptions).then(function () {
                context.commit('isAuthenticated', {
                    isAuthenticated: vueAuthInstance.isAuthenticated()
                })
            })
        },

        logout (context, payload) {
            payload = payload || {}
            return vueAuthInstance.logout(payload.requestOptions).then(function () {
                context.commit('isAuthenticated', {
                    isAuthenticated: vueAuthInstance.isAuthenticated()
                });
                context.commit('setUser', {
                    displayname: '',
                    email: ''
                });
            })
        },

        initAuth (context, payload) {
            this._vm.$client.loginWithBearer(vueAuthInstance.getToken()).then(res => {
                context.commit('setUser', {
                    displayname: res['display-name'],
                    email: Object.keys(res.email).length === 0 ? '' : res.email
                });
            });
        },

        authenticate (context, payload) {
            payload = payload || {};
            return vueAuthInstance.authenticate(payload.provider, payload.userData, payload.requestOptions).then(() => {
                context.commit('isAuthenticated', {
                    isAuthenticated: vueAuthInstance.isAuthenticated()
                });
                if (vueAuthInstance.isAuthenticated) {
                    context.dispatch('initAuth');
                }
            })
        }

    }
}
