<template>
  <div id="nav-dropdown" v-if="visible" class="oc-main-menu">
    <oc-sidebar-nav-item v-for="(n, nid) in nav" :key="nid" :icon="n.iconMaterial" :target="n.route ? n.route.path : null" @click="openItem(n.url)">{{ translateMenu(n) }}</oc-sidebar-nav-item>
    <oc-sidebar-nav-item icon="account_circle" target="/account" :isolate="true">
      <translate>Account</translate>
    </oc-sidebar-nav-item>

    <oc-sidebar-nav-item id="logoutMenuItem" active icon="exit_to_app" @click="logout()" :isolate="true">{{ _logoutItemText }}</oc-sidebar-nav-item>

    <span class="uk-position-bottom uk-padding-small">Version: {{appVersion.version}}-{{appVersion.hash}} ({{appVersion.buildDate}})</span>
  </div>
</template>

<script>
import appVersionJson from '../../build/version.json'

export default {
  props: {
    visible: {
      type: Boolean,
      required: false,
      default: false
    },
    navListUrl: {
      type: String,
      required: false,
      default: () => null
    },
    nav: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      isOpen: false,
      appVersion: appVersionJson,
      navLoaded: false
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.focusFirstLink()
        if (!this.navLoaded) {
          this.$_loadNavigation()
        }
      } else {
        this.$emit('closed')
      }
    }
  },
  computed: {
    _logoutItemText () {
      // return this.$gettextInterpolate(this.$gettext('Exit %{product}'), { product: this.configuration.theme.general.name })
      return 'Logout' // TODO
    }
  },
  methods: {
    $_loadNavigation: async function () {
      if (!this.navListUrl) {
        this.navLoaded = true
        return
      }

      // TODO: loading spinner ?

      console.log('Loading nav items from ', this.navListUrl)
      const response = await fetch(this.navListUrl, { mode: 'cors' })
      const json = await response.json()
      console.log(JSON.stringify(json))

      this.nav = json
    },
    logout () {
      this.visible = false
      this.$store.dispatch('logout')
    },
    navigateTo (route) {
      this.$router.push(route)
    },
    translateMenu (navItem) {
      // FIXME need to know the locale
      // return this.$gettext(navItem.name)
      return navItem.name
    },
    openItem (url) {
      if (url) {
        const win = window.open(url, '_blank')
        win.focus()
      }
    },
    focusFirstLink () {
      /*
      * Delay for two reasons:
      * - for screen readers Virtual buffer
      * - to outsmart uikit's focus management
      */
      setTimeout(() => {
        this.$refs.sidebar.$el.querySelector('a:first-of-type').focus()
      }, 500)
    }
  }
}
</script>
<style scoped>
#nav-dropdown {
    position: fixed;
    top: 15px;
    right: 0;
    padding-left: 32px;
    width: 200px;
    height: 300px;
    z-index: 10000;
    background-color: white;
    border: 1px solid black;
    box-shadow: 10px 1px 10px;
}
</style>
