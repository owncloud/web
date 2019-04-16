<template>
  <oc-navbar tag="header" class="oc-topbar" :sticky="true" :offset="0">
    <oc-navbar-item position="left">
      <button class="oc-topbar-menu-burger" aria-label="Files" @click="toggleSidebar(!isSidebarVisible)">
        <oc-icon name="menu" class="oc-topbar-menu-burger-icon" />
        <span class="oc-topbar-menu-burger-label">Files</span>
      </button>
    </oc-navbar-item>
    <oc-navbar-item position="center">
      <router-link to="/" class="oc-topbar-icon">ownCloud X</router-link>
    </oc-navbar-item>
    <oc-navbar-item position="right">
      <div class="oc-topbar-personal">
        <avatar class="oc-topbar-personal-avatar" :userid="user.id" />
        <span class="oc-topbar-personal-label">{{ user.displayname }}</span>
      </div>
    </oc-navbar-item>
  </oc-navbar>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import pluginHelper from '../mixins/pluginHelper.js'
import Avatar from './Avatar.vue'

export default {
  mixins: [
    pluginHelper
  ],
  components: { Avatar },
  methods: {
    ...mapActions(['toggleSidebar']),
    parseApp (app) {
      const regex = /([^/]+[.js$])\w/g
      let matched = regex.exec(app)
      return matched[0]
    }
  },
  computed: {
    ...mapGetters(['configuration', 'isSidebarVisible']),
    ...mapState(['user']),
    extendNavbarRight () {
      return this.getPlugins('phoenixNavbarRight')
    }
  }
}
</script>
