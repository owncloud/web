import Vue from 'vue'
import WebPlugin from '../plugins/web'
import Avatar from '../components/Avatar.vue'
import focusMixin from '../mixins/focusMixin'
import lifecycleMixin from '../mixins/lifecycleMixin'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(WebPlugin)

Vue.component('AvatarImage', Avatar)

Vue.mixin(focusMixin)
Vue.mixin(lifecycleMixin)

// externalize Vue - this is not the Vue instance but the class
window.Vue = Vue

export default Vue
