import 'vue-resize/dist/vue-resize.css'
import Vue from 'vue'
import MediaSource from '../plugins/mediaSource.js'
import WebPlugin from '../plugins/web'
import Avatar from '../components/Avatar.vue'
import focusMixin from '../mixins/focusMixin'
import lifecycleMixin from '../mixins/lifecycleMixin'
import ClickOutsideDirective from '../directives/clickOutside'
import VueEvents from 'vue-events'
import VueScrollTo from 'vue-scrollto'
import VueResize from 'vue-resize'
import VueMeta from 'vue-meta'
import PortalVue from 'portal-vue'
import AsyncComputed from 'vue-async-computed'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(VueCompositionAPI)
Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(VueEvents)
Vue.use(VueScrollTo)
Vue.use(MediaSource)
Vue.use(WebPlugin)
Vue.use(VueResize)
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true
})
Vue.use(PortalVue)
Vue.use(AsyncComputed)

Vue.component('avatar-image', Avatar)

Vue.mixin(focusMixin)
Vue.mixin(lifecycleMixin)

Vue.directive('click-outside', ClickOutsideDirective)

// externalize Vue - this is not the Vue instance but the class
window.Vue = Vue

export default Vue
