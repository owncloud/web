import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// Modules
import auth from './auth.js'

const store = new Vuex.Store({
  modules: {
    auth
  }
});

export default store
