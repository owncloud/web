<template>
  <oc-navbar id="oc-topbar" tag="header" class="oc-topbar uk-position-relative uk-navbar">
    <oc-navbar-item position="left">
      <oc-button v-if="hasAppNavigation" icon="menu" variation="primary" class="oc-topbar-menu-burger uk-height-1-1" aria-label="Menu" @click="$_onOpenAppNavigation" ref="menubutton">
        <span class="oc-topbar-menu-burger-label" v-translate>Menu</span>
      </oc-button>
    </oc-navbar-item>
    <oc-navbar-item position="center">
      <router-link to="/" class="oc-topbar-icon">ownCloud X</router-link>
    </oc-navbar-item>
    <oc-navbar-item position="right" v-if="!isPublicPage">
      <notifications v-if="activeNotifications.length" />
      <applications-menu :applicationsList="applicationsList"/>
      <user-menu :user-id="userId" :user-display-name="userDisplayName" />
    </oc-navbar-item>
  </oc-navbar>
</template>

<script>
import pluginHelper from '../mixins/pluginHelper.js'
import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'

export default {
  components: {
    Notifications,
    ApplicationsMenu,
    UserMenu
  },
  mixins: [
    pluginHelper
  ],
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
      default: () => null
    },
    hasAppNavigation: {
      type: Boolean,
      required: false,
      default: false
    },
    activeNotifications: {
      type: [Array, Boolean],
      required: false,
      default: () => []
    }
  },
  computed: {
    isPublicPage () {
      return !this.userId
    }
  },
  methods: {
    $_onOpenAppNavigation () {
      this.$emit('toggleAppNavigation')
    }
  }
}
</script>
