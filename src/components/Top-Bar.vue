<template>
  <div>
    <link v-if="cssUrl" rel="stylesheet" :href="cssUrl" />
    <div id="menuContainer" class="uk-offcanvas-container">
      <side-menu :nav="nav" :visible="isSidebarVisible" @closed="toggleSidebar(false)"></side-menu>
    </div>
    <oc-navbar id="oc-topbar" tag="header" class="oc-topbar uk-position-relative">
      <oc-navbar-item position="left">
        <oc-button icon="menu" variation="primary" class="oc-topbar-menu-burger uk-height-1-1" aria-label="Menu" @click="toggleSidebar(!isSidebarVisible)" v-if="!isPublicPage" ref="menubutton">
          <span class="oc-topbar-menu-burger-label" v-translate>Menu</span>
        </oc-button>
      </oc-navbar-item>
      <oc-navbar-item position="center">
        <router-link to="/" class="oc-topbar-icon">ownCloud X</router-link>
      </oc-navbar-item>
      <oc-navbar-item position="right" v-if="!isPublicPage">
        <!-- <notifications v-if="activeNotifications"></notifications> -->
        <div class="oc-topbar-personal">
          <!--    <avatar class="oc-topbar-personal-avatar" :userid="userId" /> -->
          <span class="oc-topbar-personal-label">{{ userDisplayName }}</span>
        </div>
      </oc-navbar-item>
    </oc-navbar>
  </div>
</template>

<script>
import pluginHelper from '../mixins/pluginHelper.js'
// import Avatar from './Avatar.vue'
import Menu from './Menu.vue'
// import Notifications from './Notifications.vue'
/* eslint-disable no-unused-vars */
import DesignSystem from 'owncloud-design-system'

export default {
  mixins: [
    pluginHelper
  ],
  components: {
  //    Avatar,
  //    Notifications,
    'side-menu': Menu
  },
  props: {
    showNotifications: {
      type: Boolean,
      required: false,
      default: false
    },

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
    nav: {
      type: Array,
      required: false,
      default: () => []
    },
    cssUrl: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      intervalId: null,
      isSidebarVisible: false,
      activeNotifications: []
    }
  },
  methods: {
    toggleSidebar (newState) {
      console.log('toggleSidebar: oldState=', this.isSidebarVisible, ' newState=', newState)
      this.isSidebarVisible = newState
    },
    fetchNotifications () {
      // TODO
    }
  },
  computed: {
    isPublicPage () {
      return !this.userId
    }
  },
  created: function () {
    if (this.isPublicPage) {
      return
    }

    // only fetch notifications if the server supports them
    if (this.showNotifications) {
      this.fetchNotifications(this.$client).then(() => {
        this.intervalId = setInterval(() => {
          this.fetchNotifications(this.$client).catch(() => {
            if (this.intervalId) {
              clearInterval(this.intervalId)
            }
          })
        }, 30000)
      })
    }
  },
  destroyed: function () {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  },
  watch: {
    isSidebarVisible: function (val) {
      if (!val) {
        /*
        * Delay for screen readers Virtual buffers
        */
        setTimeout(() => {
          this.$refs.menubutton.$el.focus()
        }, 500)
      }
    }
  }
}
</script>
