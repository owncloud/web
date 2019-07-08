<template>
  <oc-application-menu name="coreMenu" v-model="sidebarIsVisible" @close="sidebarIsVisible = false">
    <template slot="default">
      <oc-sidebar-nav-item v-for="(n, nid) in nav" :key="nid" :icon="n.iconMaterial" :target="n.route.path">{{ n.name }}</oc-sidebar-nav-item>

      <oc-sidebar-nav-item icon="account_circle" target="/account" :isolate="true">
        <translate>Account</translate>
      </oc-sidebar-nav-item>

      <oc-sidebar-nav-item active icon="exit_to_app" @click="logout()" :isolate="true">{{ _logoutItemText }}</oc-sidebar-nav-item>
    </template>
  </oc-application-menu>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  data () {
    return {
      isOpen: false
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
    }

  }

}
</script>
