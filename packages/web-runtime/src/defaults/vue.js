import 'vue-resize/dist/vue-resize.css'
import Vue from 'vue'
import MediaSource from '../plugins/mediaSource.js'
import WebPlugin from '../plugins/web'
import ChunkedUpload from '../plugins/upload'
import Avatar from '../components/Avatar.vue'
import focusMixin from '../mixins/focusMixin'
import lifecycleMixin from '../mixins/lifecycleMixin'
import ClickOutsideDirective from '../directives/clickOutside'
import VueEvents from 'vue-events'
import VueScrollTo from 'vue-scrollto'
import VueResize from 'vue-resize'
import VueMeta from 'vue-meta'
import Vue2TouchEvents from 'vue2-touch-events'
import PortalVue from 'portal-vue'
import AsyncComputed from 'vue-async-computed'
import { Drag, Drop } from 'vue-drag-drop'
import VueAxe from 'vue-axe'
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
Vue.use(ChunkedUpload)
Vue.use(Vue2TouchEvents)
Vue.use(PortalVue)
Vue.use(AsyncComputed)

if (process.env.NODE_ENV === 'development') {
  Vue.use(VueAxe, {
    allowConsoleClears: false
  })
}

Vue.component('drag', Drag)
Vue.component('drop', Drop)
Vue.component('avatar-image', Avatar)

Vue.mixin(focusMixin)
Vue.mixin(lifecycleMixin)

Vue.directive('click-outside', ClickOutsideDirective)

// externalize Vue - this is not the Vue instance but the class
window.Vue = Vue

export default Vue
