import 'vue-resize/dist/vue-resize.css'
import Vue from 'vue'
import WebPlugin from '../plugins/web'
import Avatar from '../components/Avatar.vue'
import focusMixin from '../mixins/focusMixin'
import lifecycleMixin from '../mixins/lifecycleMixin'
import VueEvents from 'vue-events'
import VueScrollTo from 'vue-scrollto'
import VueResize from 'vue-resize'
import VueMeta from 'vue-meta'
import PortalVue from 'portal-vue'
import AsyncComputed from 'vue-async-computed'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(VueEvents)
Vue.use(VueScrollTo)
Vue.use(WebPlugin)
Vue.use(VueResize)
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true
})
Vue.use(PortalVue)
Vue.use(AsyncComputed)

Vue.component('AvatarImage', Avatar)

Vue.mixin(focusMixin)
Vue.mixin(lifecycleMixin)

// externalize Vue - this is not the Vue instance but the class
window.Vue = Vue

export default Vue
