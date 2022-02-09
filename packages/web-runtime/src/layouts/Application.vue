<template>
  <div id="web-content">
    <div id="web-content-header">
      <top-bar :applications-list="applicationsList" :active-notifications="activeNotifications" />
    </div>
    <div id="web-content-main" class="oc-px-s oc-pb-s">
      <message-bar :active-messages="activeMessages" @deleteMessage="deleteMessage" />
      <div class="app-container oc-flex">
        <sidebar-nav v-if="isSidebarVisible" class="app-navigation" :nav-items="sidebarNavItems" />
        <router-view class="app-content oc-width-1-1" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import TopBar from '../components/Topbar/TopBar.vue'
import MessageBar from '../components/MessageBar.vue'
import SidebarNav from '../components/SidebarNav/SidebarNav.vue'

export default {
  components: {
    MessageBar,
    TopBar,
    SidebarNav
  },
  data() {
    return {
      windowWidth: 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.onResize()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  computed: {
    ...mapGetters([
      'capabilities',
      'configuration',
      'getExtensionsWithNavItems',
      'apps',
      'activeNotifications',
      'activeMessages',
      'getNavItemsByExtension'
    ]),
    isSidebarVisible() {
      return this.sidebarNavItems.length && this.windowWidth >= 640
    },
    sidebarNavItems() {
      if (this.publicPage()) {
        return []
      }

      const items = this.getNavItemsByExtension(this.currentExtension)
      if (!items) {
        return []
      }

      items.filter((item) => {
        if (this.capabilities === undefined) {
          return false
        }

        if (item.enabled === undefined) {
          return true
        }

        return item.enabled(this.capabilities)
      })

      const { href: currentHref } = this.$router.resolve(this.$route)
      return items.map((item) => {
        const { href: comparativeHref } = this.$router.resolve(item.route)

        return {
          ...item,
          name: this.$gettext(item.name),
          active: currentHref.startsWith(comparativeHref)
        }
      })
    },
    applicationsList() {
      const list = []

      // Get extensions which have at least one nav item
      this.getExtensionsWithNavItems.forEach((extensionId) => {
        list.push({
          ...this.apps[extensionId],
          type: 'extension'
        })
      })

      // Get extensions manually added into config
      this.configuration.applications.forEach((application) => {
        list.push({
          ...application,
          type: 'link'
        })
      })

      return list
    }
  },
  methods: {
    ...mapActions(['deleteMessage']),
    onResize() {
      this.windowWidth = window.innerWidth
    }
  }
}
</script>
<style lang="scss">
#web-content {
  display: flex;
  flex-flow: column;
  flex-wrap: nowrap;
  height: 100vh;

  #web-content-header,
  #web-content-main {
    flex-shrink: 1;
    flex-basis: auto;
  }

  #web-content-header {
    flex-grow: 0;
  }

  #web-content-main {
    flex-grow: 1;
    overflow-y: hidden;

    .app-container {
      height: 100%;
      background-color: var(--oc-color-background-default);
      border-radius: 15px;
      overflow: hidden;

      .app-content {
        transition: all 0.35s cubic-bezier(0.34, 0.11, 0, 1.12);
      }
    }
  }
}
</style>
