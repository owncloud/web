<template>
  <oc-left-menu name="coreMenu" v-model="sidebarIsVisible" @close="sidebarIsVisible = false">
    <template slot="default">
      <oc-sidebar-nav-item v-for="(n, nid) in nav" :key="nid" :text="n.name" :icon="n.iconMaterial" :target="n.route" />
      <oc-sidebar-nav-divider />
      <oc-sidebar-nav-item text="Exit ownCloud" active icon="exit_to_app" target="login" />
    </template>
  </oc-left-menu>
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
