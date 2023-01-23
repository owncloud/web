import Vue from 'vue'
import WebPlugin from '../plugins/web'
import Avatar from '../components/Avatar.vue'
import focusMixin from '../mixins/focusMixin'
import lifecycleMixin from '../mixins/lifecycleMixin'

Vue.use(WebPlugin)

Vue.component('AvatarImage', Avatar)

Vue.mixin(focusMixin)
Vue.mixin(lifecycleMixin)

// externalize Vue - this is not the Vue instance but the class
window.Vue = Vue

export default Vue
