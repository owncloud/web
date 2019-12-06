<template>
  <div>
    <link v-if="phoenixUrl" rel="stylesheet" :href="phoenixUrl + '/dist-wc/design-system/system.css'" />
    <message-bar />
    <applications-menu :applicationsListUrl="applicationsListUrl" :visible="isApplicationsMenuVisible" @closed="toggleApplicationsMenu(false)" />
    <side-menu v-if="appNavigation.length" :entries="appNavigation" :visible="isSideMenuVisible" />
    <oc-navbar id="oc-topbar" tag="header" class="oc-topbar uk-position-relative uk-navbar">
      <oc-navbar-item position="left">
        <oc-button v-if="appNavigation.length" icon="menu" variation="primary" class="oc-topbar-menu-burger uk-height-1-1" aria-label="Menu" @click="toggleSideMenu(!isSideMenuVisible)" ref="menubutton">
          <span class="oc-topbar-menu-burger-label" v-translate>Menu</span>
        </oc-button>
      </oc-navbar-item>
      <oc-navbar-item position="center">
        <router-link to="/" class="oc-topbar-icon">ownCloud X</router-link>
      </oc-navbar-item>
      <oc-navbar-item position="right" v-if="!isPublicPage">
        <notifications v-if="activeNotifications.length"></notifications>
        <oc-button icon="menu" variation="primary" class="oc-topbar-menu-burger uk-height-1-1" aria-label="Menu" @click="toggleApplicationsMenu(!isApplicationsMenuVisible)" v-if="!isPublicPage" ref="menubutton">
        </oc-button>
        <div class="oc-topbar-personal">
          <avatar class="oc-topbar-personal-avatar" :userid="userId" />
          <span class="oc-topbar-personal-label">{{ userDisplayName }}</span>
        </div>
      </oc-navbar-item>
    </oc-navbar>
  </div>
</template>

<script>
// import externalComponent from '../utils/external-component.js'
import pluginHelper from '../mixins/pluginHelper.js'
import Avatar from './Avatar.vue'
import ApplicationsMenu from './ApplicationsMenu.vue'
import SideMenu from './Menu.vue'
import MessageBar from './MessageBar.vue'
import Notifications from './Notifications.vue'
// FIXME: replace with dynamic load with externalComponent()
/* eslint-disable no-unused-vars */
import DesignSystem from 'owncloud-design-system'

export default {
  mixins: [
    pluginHelper
  ],
  components: {
    Avatar,
    Notifications,
    ApplicationsMenu,
    SideMenu,
    MessageBar
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
    applicationsListUrl: {
      type: String,
      required: false,
      default: () => null
    },
    appNavigation: {
      type: Array,
      required: false,
      default: () => []
    },
    phoenixUrl: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      intervalId: null,
      isApplicationsMenuVisible: false,
      isSideMenuVisible: false,
      activeNotifications: []
    }
  },
  methods: {
    toggleApplicationsMenu (newState) {
      this.isApplicationsMenuVisible = newState
      if (newState) {
        this.isSideMenuVisible = false
      }
    },
    toggleSideMenu (newState) {
      this.isSideMenuVisible = newState
      if (newState) {
        this.isApplicationsMenuVisible = false
      }
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
    // await externalComponent(this.phoenixUrl + '/dist-wc/design-system/system.js')
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
    isApplicationsMenuVisible: function (val) {
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
