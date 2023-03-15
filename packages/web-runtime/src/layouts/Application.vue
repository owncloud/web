<template>
  <div id="web-content">
    <loading-indicator />
    <div id="web-content-header">
      <div v-if="isIE11" class="oc-background-muted oc-text-center oc-py-m">
        <p class="oc-m-rm" v-text="ieDeprecationWarning" />
      </div>
      <top-bar :applications-list="applicationsList" />
    </div>
    <div id="web-content-main" class="oc-px-s oc-pb-s">
      <div class="app-container oc-flex">
        <sidebar-nav v-if="isSidebarVisible" class="app-navigation" :nav-items="sidebarNavItems" />
        <app-loading-spinner v-if="isLoading" />
        <template v-else>
          <router-view
            v-for="name in ['default', 'app', 'fullscreen']"
            :key="`router-view-${name}`"
            class="app-content oc-width-1-1"
            :name="name"
          />
        </template>
      </div>
    </div>
    <div class="snackbars">
      <message-bar :active-messages="activeMessages" @delete-message="deleteMessage" />
      <upload-info />
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters } from 'vuex'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import TopBar from '../components/Topbar/TopBar.vue'
import MessageBar from '../components/MessageBar.vue'
import SidebarNav from '../components/SidebarNav/SidebarNav.vue'
import UploadInfo from '../components/UploadInfo.vue'
import LoadingIndicator from 'web-pkg/src/components/LoadingIndicator.vue'
import {
  useActiveApp,
  useRoute,
  useRouteMeta,
  useSpacesLoading,
  useStore,
  useUserContext
} from 'web-pkg/src/composables'
import { computed, defineComponent, unref, watch } from 'vue'

export default defineComponent({
  name: 'ApplicationLayout',
  components: {
    AppLoadingSpinner,
    MessageBar,
    TopBar,
    SidebarNav,
    UploadInfo,
    LoadingIndicator
  },
  setup() {
    const store = useStore()
    // FIXME: we can convert to a single router-view without name (thus without the loop) and without this watcher when we release v6.0.0
    watch(
      useRoute(),
      (route) => {
        if (unref(route).matched.length) {
          unref(route).matched.forEach((match) => {
            const keys = Object.keys(match.components).filter((key) => key !== 'default')
            if (keys.length) {
              console.warn(
                `named components are deprecated, use "default" instead of "${keys.join(
                  ', '
                )}" on route ${String(route.name)}`
              )
            }
          })
        }
      },
      { immediate: true }
    )

    const requiredAuthContext = useRouteMeta('authContext')
    const { areSpacesLoading } = useSpacesLoading({ store })
    const isLoading = computed(() => {
      if (unref(requiredAuthContext) === 'anonymous') {
        return false
      }
      return unref(areSpacesLoading)
    })
    return {
      isLoading,
      activeApp: useActiveApp(),
      isUserContext: useUserContext({ store })
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
      if (!this.isUserContext) {
        return []
      }

      const items = this.getNavItemsByExtension(this.activeApp)
      if (!items) {
        return []
      }

      const { href: currentHref } = this.$router.resolve(this.$route)
      return items.map((item) => {
        const active = [item.route, ...(item.activeFor || [])]
          .filter(Boolean)
          .some((currentItem) => {
            try {
              const comparativeHref = this.$router.resolve(currentItem).href
              return currentHref.startsWith(comparativeHref)
            } catch (e) {
              console.error(e)
              return false
            }
          })

        const name = typeof item.name === 'function' ? item.name(this.capabilities) : item.name

        return {
          ...item,
          name: this.$gettext(name),
          active
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
  beforeUnmount() {
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

  .snackbars {
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 1040;

    @media (max-width: 640px) {
      left: 0;
      right: 0;
      margin: 0 auto;
      width: 100%;
      max-width: 500px;
    }
  }
}
</style>
