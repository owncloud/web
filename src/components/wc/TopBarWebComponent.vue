<template>
  <div v-if="!loadingConfig">
    <link v-if="phoenixUrl" rel="stylesheet" :href="phoenixUrl + '/dist-wc/design-system/system.css'" />
    <top-bar
      :user-id="userId"
      :user-display-name="userDisplayName"
      :applications-list="$_applicationsList"
      :active-notifications="activeNotifications"
      />
  </div>
</template>

<script>
import init from '../../init.js'
import TopBar from '../Top-Bar.vue'
import store from '../../store'
// FIXME: remove this
import router from '../../router'

export default {
  store,
  name: 'TopBarWebComponent',
  components: {
    TopBar
  },
  props: {
    userId: {
      type: String,
      required: false,
      default: null
    },
    userDisplayName: {
      type: String,
      required: false,
      default: null
    },
    applicationsList: {
      type: Array,
      required: false,
      default: () => []
    },
    activeNotifications: {
      type: [Array, Boolean],
      required: false,
      default: () => []
    },
    phoenixUrl: {
      type: String,
      required: false
    },
    serverUrl: {
      type: String,
      required: false
    },
    lang: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      loadingConfig: true,
      config: null
    }
  },
  computed: {
    $_applicationsList () {
      return this.config.applications
    }
  },
  beforeMount: async function () {
    /* global Vue */
    const { config } = await init(Vue, this.phoenixUrl, { store, router }, true)
    config.isWebComponent = true
    config.enableAvatars = true
    this.config = config
    this.$root.config = config
    console.log('got config: ', config)
    this.loadingConfig = false
  }
}
</script>
