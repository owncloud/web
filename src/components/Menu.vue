<template>
  <oc-application-menu name="coreMenu" v-model="sidebarIsVisible" @close="sidebarIsVisible = false">
    <oc-sidebar-nav-item v-for="(n, nid) in nav" :active="isActive(n)" :key="nid" :icon="n.iconMaterial" :target="n.route ? n.route.path : null" @click="openItem(n.url)">{{ translateMenu(n) }}</oc-sidebar-nav-item>

    <oc-sidebar-nav-item icon="account_circle" target="/account" :isolate="true">
      <translate>Account</translate>
    </oc-sidebar-nav-item>

    <oc-sidebar-nav-item id="logoutMenuItem" active icon="exit_to_app" @click="logout()" :isolate="true">{{ _logoutItemText }}</oc-sidebar-nav-item>

    <span class="uk-position-bottom uk-padding-small">Version: {{appVersion.version}}-{{appVersion.hash}} ({{appVersion.buildDate}})</span>
  </oc-application-menu>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import appVersionJson from '../../build/version.json'

export default {
  data () {
    return {
      isOpen: false,
      appVersion: appVersionJson
    }
  },
  watch: {
    $route () {
      this.toggleSidebar(false)
    }
  },
  computed: {
    nav () {
      return this.$root.navItems.filter(item => {
        if (item.enabled === undefined) {
          return true
        }
        if (this.capabilities === undefined) {
          return false
        }
        return item.enabled(this.capabilities)
      })
    },
    ...mapGetters(['isSidebarVisible', 'configuration', 'capabilities']),
    sidebarIsVisible: {
      get () {
        return this.isSidebarVisible
      },
      set (newVal) {
        if (newVal) {
          return
        }
        this.toggleSidebar(newVal)
      }
    },
    _logoutItemText () {
      return this.$gettextInterpolate(this.$gettext('Exit %{product}'), { product: this.configuration.theme.general.name })
    }
  },
  methods: {
    ...mapActions(['toggleSidebar']),
    logout () {
      this.sidebarIsVisible = false
      this.$store.dispatch('logout')
    },
    navigateTo (route) {
      this.$router.push(route)
    },
    translateMenu (navItem) {
      return this.$gettext(navItem.name)
    },
    openItem (url) {
      if (url) {
        const win = window.open(url, '_blank')
        win.focus()
      }
    },
    isActive (navItem) {
      return navItem.route.name === this.$route.name
    }
  }
}
</script>
