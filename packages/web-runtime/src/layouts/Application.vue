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
        <app-loading-spinner v-if="isLoading" />
        <template v-else>
          <sidebar-nav v-if="isSidebarVisible" class="app-navigation" :nav-items="navItems" />
          <portal to="app.runtime.mobile.nav">
            <mobile-nav v-if="isMobileWidth" :nav-items="navItems" />
          </portal>
          <router-view
            v-for="name in ['default', 'app', 'fullscreen']"
            :key="`router-view-${name}`"
            class="app-content oc-width-1-1"
            :name="name"
          />
        </template>
      </div>

      <portal-target name="app.runtime.footer" />
    </div>
    <div class="snackbars">
      <message-bar :active-messages="activeMessages" @delete-message="deleteMessage" />
      <upload-info />
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters } from 'vuex'
import orderBy from 'lodash-es/orderBy'
import { AppLoadingSpinner, SidebarNavExtension, useExtensionRegistry } from '@ownclouders/web-pkg'
import TopBar from '../components/Topbar/TopBar.vue'
import MessageBar from '../components/MessageBar.vue'
import SidebarNav from '../components/SidebarNav/SidebarNav.vue'
import UploadInfo from '../components/UploadInfo.vue'
import MobileNav from '../components/MobileNav.vue'
import { NavItem } from '../helpers/navItems'
import { LoadingIndicator } from '@ownclouders/web-pkg'
import {
  useActiveApp,
  useRoute,
  useRouteMeta,
  useSpacesLoading,
  useStore,
  useUserContext
} from '@ownclouders/web-pkg'
import { computed, defineComponent, provide, ref, unref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'

import '@uppy/core/dist/style.min.css'
import { AppNavigationItem } from '@ownclouders/web-pkg'

const MOBILE_BREAKPOINT = 640

export default defineComponent({
  name: 'ApplicationLayout',
  components: {
    AppLoadingSpinner,
    MessageBar,
    MobileNav,
    TopBar,
    SidebarNav,
    UploadInfo,
    LoadingIndicator
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const { $gettext } = useGettext()
    const isUserContext = useUserContext({ store })
    const activeApp = useActiveApp()
    const extensionRegistry = useExtensionRegistry()

    const extensionNavItems = computed(() =>
      extensionRegistry
        .requestExtensions<SidebarNavExtension>('sidebarNav', [
          unref(activeApp),
          `app.${unref(activeApp)}`
        ])
        .map(({ navItem }) => navItem)
        .filter((n) => n.enabled(store.getters.capabilities))
    )

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
      if (['anonymous', 'idp'].includes(unref(requiredAuthContext))) {
        return false
      }
      return unref(areSpacesLoading)
    })

    const isMobileWidth = ref<boolean>(window.innerWidth < MOBILE_BREAKPOINT)
    provide('isMobileWidth', isMobileWidth)
    const onResize = () => {
      isMobileWidth.value = window.innerWidth < MOBILE_BREAKPOINT
    }

    const navItems = computed<NavItem[]>(() => {
      if (!unref(isUserContext)) {
        return []
      }

      const items = [
        ...store.getters['getNavItemsByExtension'](unref(activeApp)),
        ...unref(extensionNavItems)
      ] as AppNavigationItem[]

      const { href: currentHref } = router.resolve(unref(route))
      return orderBy(
        items.map((item) => {
          let active = typeof item.isActive !== 'function' || item.isActive()

          if (active) {
            active = [item.route, ...(item.activeFor || [])].filter(Boolean).some((currentItem) => {
              try {
                const comparativeHref = router.resolve(currentItem).href
                return currentHref.startsWith(comparativeHref)
              } catch (e) {
                console.error(e)
                return false
              }
            })
          }

          const name =
            typeof item.name === 'function' ? item.name(store.getters['capabilities']) : item.name

          return {
            ...item,
            name: $gettext(name),
            active
          }
        }),
        ['priority', 'name']
      )
    })

    const isSidebarVisible = computed(() => {
      return unref(navItems).length && !unref(isMobileWidth)
    })

    return {
      isSidebarVisible,
      isLoading,
      navItems,
      onResize,
      isMobileWidth
    }
  },
  computed: {
    ...mapGetters(['apps', 'activeMessages', 'configuration', 'getExtensionsWithNavItems']),
    isIE11() {
      return !!(window as any).MSInputMethodContext && !!(document as any).documentMode
    },
    ieDeprecationWarning() {
      return this.$gettext(
        'Internet Explorer (your current browser) is not officially supported. For security reasons, please switch to another browser.'
      )
    },

    applicationsList() {
      const list = []

      Object.values(this.apps).forEach((app: any) => {
        list.push({
          ...app,
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

      return list.sort(
        (a, b) =>
          (a.applicationMenu?.priority || Number.MAX_SAFE_INTEGER) -
          (b.applicationMenu?.priority || Number.MAX_SAFE_INTEGER)
      )
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
    ...mapActions(['deleteMessage'])
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
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: flex-start;
    overflow-y: hidden;

    .app-container {
      height: 100%;
      background-color: var(--oc-color-background-default);
      border-radius: 15px;
      overflow: hidden;
      width: 100%;

      .app-content {
        transition: all 0.35s cubic-bezier(0.34, 0.11, 0, 1.12);
      }
    }
  }

  .snackbars {
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: calc(var(--oc-z-index-modal) + 1);

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
