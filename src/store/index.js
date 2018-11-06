import Vue from 'vue'
import Vuex from 'vuex'

// Modules
import auth from './auth.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    config: {
      auth: {
        clientId: '',
        apiUrl: '',
        authUrl: ''
      }
    }
  },
  modules: {
    auth
  }
})

export default store
