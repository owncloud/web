<template>
  <oc-application-menu name="coreMenu" v-model="visible" :inert="!visible" ref="sidebar">
    <oc-sidebar-nav-item v-for="(n, nid) in entries" :active="isActive(n)" :key="nid" :icon="n.iconMaterial" :target="n.route ? n.route.path : null" @click="openItem(n.url)">{{ translateMenu(n) }}</oc-sidebar-nav-item>
    <!--
    <span class="uk-position-bottom uk-padding-small">Version: {{appVersion.version}}-{{appVersion.hash}} ({{appVersion.buildDate}})</span>
    -->
  </oc-application-menu>
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
    entries: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      isOpen: false,
      appVersion: appVersionJson
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.focusFirstLink()
      } else {
        this.$emit('closed')
      }
    }
  },
  computed: {
  },
  methods: {
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
