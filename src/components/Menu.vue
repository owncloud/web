<template>
  <oc-application-menu name="coreMenu" v-model="sidebarIsVisible" @close="sidebarIsVisible = false">
    <template slot="default">
      <oc-sidebar-nav-item v-for="(n, nid) in nav" :key="nid" :text="n.name" :icon="n.iconMaterial" :target="n.route.name" />
      <oc-sidebar-nav-divider />
      <oc-sidebar-nav-item :text="_logoutItemText" active icon="exit_to_app" @click="logout()" />
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
  computed: {
    nav () {
      return this.$root.navItems
    },
    ...mapGetters(['isSidebarVisible']),
    ...mapGetters(['configuration']),
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
      return this.$gettextInterpolate(this.$gettext('Exit %{product}'), { product: 'ownCloud' })
    }
  },
  methods: {
    ...mapActions(['toggleSidebar']),
    notImplemented () {
      // TODO: tempelgogo's snackbarQueue
      console.log('snackbar should be here')
    },
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
