<template>
  <div id="web-content">
    <div id="web-content-header">
      <div v-if="isIE11" class="oc-background-muted oc-text-center oc-py-m">
        <p class="oc-m-rm" v-text="ieDeprecationWarning" />
      </div>
      <top-bar :applications-list="applicationsList" :active-notifications="activeNotifications" />
    </div>
    <div id="web-content-main" class="oc-px-s oc-pb-s">
      <message-bar :active-messages="activeMessages" @deleteMessage="deleteMessage" />
      <div class="app-container oc-flex">
        <sidebar-nav v-if="isSidebarVisible" class="app-navigation" :nav-items="sidebarNavItems" />
        <router-view
          v-for="name in ['default', 'app', 'fullscreen']"
          :key="`router-view-${name}`"
          class="app-content oc-width-1-1"
          :name="name"
        />
      </div>
    </div>
    <upload-info />
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters } from 'vuex'
import TopBar from '../components/Topbar/TopBar.vue'
import MessageBar from '../components/MessageBar.vue'
import SidebarNav from '../components/SidebarNav/SidebarNav.vue'
import UploadInfo from '../components/UploadInfo.vue'
import { useActiveApp, useRoute } from 'web-pkg/src/composables'
import { watch, defineComponent } from '@vue/composition-api'

export default defineComponent({
  components: {
    MessageBar,
    TopBar,
    SidebarNav,
    UploadInfo
  },
  setup() {
    // FIXME: we can convert to a single router-view without name (thus without the loop) and without this watcher when we release v6.0.0
    watch(
      useRoute(),
      (route) => {
        if (route.matched.length) {
          route.matched.forEach((match) => {
            const keys = Object.keys(match.components).filter((key) => key !== 'default')
            if (keys.length) {
              console.warn(
                `named components are deprecated, use "default" instead of "${keys.join(
                  ', '
                )}" on route ${route.name}`
              )
            }
          })
        }
      },
      { immediate: true }
    )
    return {
      activeApp: useActiveApp()
    }
  },
  data() {
    return {
      windowWidth: 0
    }
  },
  computed: {
    ...mapGetters([
      'apps',
      'activeMessages',
      'activeNotifications',
      'capabilities',
      'configuration',
      'getExtensionsWithNavItems',
      'getNavItemsByExtension'
    ]),
    isIE11() {
      return !!(window as any).MSInputMethodContext && !!(document as any).documentMode
    },
    ieDeprecationWarning() {
      return this.$gettext(
        'Internet Explorer (your current browser) is not officially supported. For security reasons, please switch to another browser.'
      )
    },
    isSidebarVisible() {
      return this.sidebarNavItems.length && this.windowWidth >= 640
    },
    sidebarNavItems() {
      if (this.publicPage()) {
        return []
      }

      const items = this.getNavItemsByExtension(this.activeApp)
      if (!items) {
        return []
      }

      const { href: currentHref } = this.$router.resolve(this.$route)
      return items.map((item) => {
        const { href: comparativeHref } = this.$router.resolve(item.route)

        const name = typeof item.name === 'function' ? item.name(this.capabilities) : item.name

        return {
          ...item,
          name: this.$gettext(name),
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
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.onResize()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    ...mapActions(['deleteMessage']),
    onResize() {
      this.windowWidth = window.innerWidth
    }
  }
})
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
