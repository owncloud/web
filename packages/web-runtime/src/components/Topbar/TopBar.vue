<template>
  <header
    id="oc-topbar"
    :class="{ 'open-app': contentOnLeftPortal }"
    :aria-label="$gettext('Top bar')"
  >
    <div class="oc-topbar-left oc-flex oc-flex-middle oc-flex-start">
      <applications-menu
        v-if="appMenuItems.length && !isEmbedModeEnabled"
        :applications-list="appMenuItems"
      />
      <router-link
        v-if="!isFilePicker"
        ref="navigationSidebarLogo"
        :to="homeLink"
        class="oc-width-1-1"
      >
        <oc-img
          v-oc-tooltip="$gettext('Back to home')"
          :src="currentTheme.logo.topbar"
          :alt="sidebarLogoAlt"
          class="oc-logo-image"
        />
      </router-link>
    </div>
    <div v-if="!contentOnLeftPortal" class="oc-topbar-center">
      <custom-component-target :extension-point="topBarCenterExtensionPoint" />
    </div>
    <div class="oc-topbar-right oc-flex oc-flex-middle">
      <portal-target name="app.runtime.header.right" multiple />
    </div>
    <template v-if="!isEmbedModeEnabled">
      <portal to="app.runtime.header.right" :order="50">
        <feedback-link v-if="isFeedbackLinkEnabled" v-bind="feedbackLinkOptions" />
      </portal>
      <portal to="app.runtime.header.right" :order="100">
        <notifications v-if="isNotificationBellEnabled" />
        <side-bar-toggle v-if="isSideBarToggleVisible" :disabled="isSideBarToggleDisabled" />
        <user-menu :applications-list="userMenuItems" />
      </portal>
    </template>
    <portal-target name="app.runtime.header.left" @change="updateLeftPortal" />
  </header>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { computed, unref, PropType, ref } from 'vue'
import { useGettext } from 'vue3-gettext'

import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'
import FeedbackLink from './FeedbackLink.vue'
import SideBarToggle from './SideBarToggle.vue'
import {
  ApplicationInformation,
  CustomComponentTarget,
  useAuthStore,
  useCapabilityStore,
  useConfigStore,
  useEmbedMode,
  useRouter,
  useThemeStore
} from '@ownclouders/web-pkg'
import { isRuntimeRoute } from '../../router'
import { MenuItem } from '../../helpers/menuItems'
import { topBarCenterExtensionPoint } from '../../extensionPoints'

type Menus = 'apps' | 'appSwitcher' | 'user'

export default {
  components: {
    ApplicationsMenu,
    CustomComponentTarget,
    FeedbackLink,
    Notifications,
    SideBarToggle,
    UserMenu
  },
  props: {
    applicationsList: {
      type: Array as PropType<ApplicationInformation[]>,
      required: false,
      default: (): ApplicationInformation[] => []
    }
  },
  setup(props) {
    const capabilityStore = useCapabilityStore()
    const themeStore = useThemeStore()
    const { currentTheme } = storeToRefs(themeStore)
    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const authStore = useAuthStore()
    const language = useGettext()
    const router = useRouter()
    const { isEnabled: isEmbedModeEnabled, isFilePicker } = useEmbedMode()

    const logoWidth = ref('150px')
    const isNotificationBellEnabled = computed(() => {
      return (
        authStore.userContextReady && capabilityStore.notificationsOcsEndpoints.includes('list')
      )
    })

    const homeLink = computed(() => {
      if (authStore.publicLinkContextReady && !authStore.userContextReady) {
        return {
          name: 'resolvePublicLink',
          params: { token: authStore.publicLinkToken }
        }
      }

      return '/'
    })

    const isSideBarToggleVisible = computed(() => {
      return authStore.userContextReady || authStore.publicLinkContextReady
    })
    const isSideBarToggleDisabled = computed(() => {
      return isRuntimeRoute(unref(router.currentRoute))
    })

    const isNavItemPermitted = (permittedMenus: Menus[], navItem: ApplicationInformation) => {
      // FIXME: there is no menu...
      if ((navItem as any).menu) {
        return permittedMenus.includes((navItem as any).menu)
      }
      return permittedMenus.includes(null)
    }

    /**
     * Returns well-formed menuItem objects by a list of extensions.
     * The following properties must be accessible in the wrapping code:
     * - applicationsList
     * - $language
     */
    const getMenuItems = (permittedMenus: Menus[], activeRoutePath: string) => {
      return props.applicationsList
        .filter((app) => {
          if (app.type === 'extension') {
            return app.applicationMenu?.enabled() && !permittedMenus.includes('user')
          }
          return isNavItemPermitted(permittedMenus, app)
        })
        .map<MenuItem>((item) => {
          // FIXME: types are a mess here
          const _item = item as any

          const lang = language.current
          // TODO: move language resolution to a common function
          // FIXME: need to handle logic for variants like en_US vs en_GB
          let title = _item.title ? _item.title.en : _item.name
          let color = _item.color
          let icon: string
          let iconUrl: string
          if (_item.title && _item.title[lang]) {
            title = _item.title[lang]
          }

          if (!item.icon) {
            icon = 'deprecated' // "broken" icon
          } else if (item.icon.indexOf('.') < 0) {
            // not a file name or URL, treat as a material icon name instead
            icon = item.icon
          } else {
            iconUrl = item.icon
          }

          const app: MenuItem = {
            id: _item.id,
            icon: icon,
            iconUrl: iconUrl,
            title: title,
            color: color,
            defaultExtension: _item.defaultExtension,
            ..._item.applicationMenu
          }

          if (_item.url) {
            app.url = _item.url
            app.target = ['_blank', '_self', '_parent', '_top'].includes(_item.target)
              ? _item.target
              : '_blank'
          } else if (_item.path) {
            app.path = _item.path
            app.active = activeRoutePath?.startsWith(app.path)
          } else {
            app.path = `/${_item.id}`
            app.active = activeRoutePath?.startsWith(app.path)
          }

          return app
        })
    }

    const activeRoutePath = computed(() => router.resolve(unref(router.currentRoute)).path)
    const userMenuItems = computed(() => getMenuItems(['user'], unref(activeRoutePath)))
    const appMenuItems = computed(() =>
      getMenuItems([null, 'apps', 'appSwitcher'], unref(activeRoutePath))
    )

    const contentOnLeftPortal = ref(false)
    const updateLeftPortal = (newContent: { hasContent: boolean; sources: string[] }) => {
      contentOnLeftPortal.value = newContent.hasContent
    }

    return {
      configOptions,
      contentOnLeftPortal,
      currentTheme,
      updateLeftPortal,
      isNotificationBellEnabled,
      userMenuItems,
      appMenuItems,
      logoWidth,
      isEmbedModeEnabled,
      isSideBarToggleVisible,
      isSideBarToggleDisabled,
      homeLink,
      topBarCenterExtensionPoint,
      isFilePicker
    }
  },
  computed: {
    sidebarLogoAlt() {
      return this.$gettext('Navigate to personal files page')
    },

    isFeedbackLinkEnabled() {
      return !this.configOptions.disableFeedbackLink
    },

    feedbackLinkOptions() {
      const feedback = this.configOptions.feedbackLink
      if (!this.isFeedbackLinkEnabled || !feedback) {
        return {}
      }

      return {
        ...(feedback.href && { href: feedback.href }),
        ...(feedback.ariaLabel && { ariaLabel: feedback.ariaLabel }),
        ...(feedback.description && { description: feedback.description })
      }
    }
  },
  async created() {
    const image = new Image()
    const imageDimensions = (await new Promise((resolve) => {
      image.onload = () => {
        resolve({
          height: image.height,
          width: image.width
        })
      }
      image.src = this.currentTheme.logo.topbar
    })) as { height: number; width: number }
    // max-height of logo is 38px, so we calculate the width based on the ratio of the image
    // and add 70px to account for the width of the left side of the topbar
    this.logoWidth = `${imageDimensions.width / (imageDimensions.height / 38) + 70}px`
  }
}
</script>

<style lang="scss">
#oc-topbar {
  align-items: center;
  display: grid;
  grid-template-areas: 'logo center right' 'secondRow secondRow secondRow';
  grid-template-columns: 30% 30% 40%;
  grid-template-rows: 52px auto;
  padding: 0 1rem;
  position: sticky;
  z-index: 5;

  @media (min-width: $oc-breakpoint-small-default) {
    column-gap: 10px;
    grid-template-columns: v-bind(logoWidth) 9fr 1fr;
    grid-template-rows: 1;
    height: 52px;
    justify-content: center;
    padding: 0 1.1rem;
  }

  &.open-app {
    grid-template-columns: 30% 30% 40%;

    @media (min-width: $oc-breakpoint-small-default) {
      grid-template-columns: v-bind(logoWidth) 1fr 1fr;
    }
  }

  img {
    max-height: 38px;
    image-rendering: auto;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    image-rendering: -webkit-optimize-contrast;
    user-select: none;
  }

  .oc-topbar-left {
    gap: 10px;
    grid-area: logo;
    @media (min-width: $oc-breakpoint-small-default) {
      gap: 20px;
    }
  }

  .oc-topbar-center {
    display: flex;
    grid-area: center;
    justify-content: flex-end;

    @media (min-width: $oc-breakpoint-small-default) {
      justify-content: center;
    }
  }

  .oc-topbar-right {
    gap: 10px;
    grid-area: right;
    justify-content: space-between;

    @media (min-width: $oc-breakpoint-small-default) {
      gap: 20px;
      justify-content: flex-end;
    }
  }
}
</style>
