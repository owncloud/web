<template>
  <header
    id="oc-topbar"
    :class="{ 'open-app': contentOnLeftPortal }"
    :aria-label="$gettext('Top bar')"
  >
    <div class="oc-topbar-left oc-flex oc-flex-middle oc-flex-start">
      <applications-menu v-if="appMenuItems.length" :applications-list="appMenuItems" />
      <router-link
        ref="navigationSidebarLogo"
        v-oc-tooltip="$gettext('Back to home')"
        to="/"
        class="oc-width-1-1"
      >
        <oc-img :src="logoImage" :alt="sidebarLogoAlt" class="oc-logo-image" />
      </router-link>
    </div>
    <div v-if="!contentOnLeftPortal" class="oc-topbar-center">
      <portal-target name="app.runtime.header" multiple />
    </div>
    <div class="oc-topbar-right oc-flex oc-flex-middle">
      <portal-target name="app.runtime.header.right" multiple />
    </div>
    <portal to="app.runtime.header.right" :order="50">
      <theme-switcher v-if="darkThemeAvailable" />
      <feedback-link v-if="isFeedbackLinkEnabled" v-bind="feedbackLinkOptions" />
    </portal>
    <portal to="app.runtime.header.right" :order="100">
      <notifications v-if="isNotificationBellEnabled" />
      <user-menu :applications-list="userMenuItems" />
    </portal>
    <portal-target name="app.runtime.header.left" @change="updateLeftPortal" />
  </header>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'

import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'
import FeedbackLink from './FeedbackLink.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import {
  useCapabilityNotifications,
  useRouter,
  useStore,
  useUserContext
} from 'web-pkg/src/composables'
import { computed, unref, PropType, ref } from 'vue'
import { useGettext } from 'vue3-gettext'

export default {
  components: {
    ApplicationsMenu,
    FeedbackLink,
    Notifications,
    ThemeSwitcher,
    UserMenu
  },
  props: {
    applicationsList: {
      type: Array as PropType<any[]>,
      required: false,
      default: () => []
    }
  },
  setup(props) {
    const store = useStore()
    const notificationsSupport = useCapabilityNotifications()
    const isUserContext = useUserContext({ store })
    const language = useGettext()
    const router = useRouter()

    const logoWidth = ref('150px')
    const isNotificationBellEnabled = computed(() => {
      return unref(isUserContext) && unref(notificationsSupport).includes('list')
    })

    const isNavItemPermitted = (permittedMenus, navItem) => {
      if (navItem.menu) {
        return permittedMenus.includes(navItem.menu)
      }
      return permittedMenus.includes(null)
    }

    /**
     * Returns well formed menuItem objects by a list of extensions.
     * The following properties must be accessible in the wrapping code:
     * - applicationsList
     * - $language
     *
     * @param {Array} permittedMenus
     * @param {String} activeRoutePath
     * @returns {*}
     */
    const getMenuItems = (permittedMenus, activeRoutePath) => {
      return props.applicationsList
        .filter((app) => {
          if (app.type === 'extension') {
            // check if the extension has at least one navItem with a matching menuId
            return (
              store.getters
                .getNavItemsByExtension(app.id)
                .filter((navItem) => isNavItemPermitted(permittedMenus, navItem)).length > 0
            )
          }
          return isNavItemPermitted(permittedMenus, app)
        })
        .map((item) => {
          const lang = language.current
          // TODO: move language resolution to a common function
          // FIXME: need to handle logic for variants like en_US vs en_GB
          let title = item.title ? item.title.en : item.name
          let color = item.color
          let icon
          let iconUrl
          if (item.title && item.title[lang]) {
            title = item.title[lang]
          }

          if (!item.icon) {
            icon = 'deprecated' // "broken" icon
          } else if (item.icon.indexOf('.') < 0) {
            // not a file name or URL, treat as a material icon name instead
            icon = item.icon
          } else {
            iconUrl = item.icon
          }

          const app: any = {
            icon: icon,
            iconUrl: iconUrl,
            title: title,
            color: color
          }

          if (item.url) {
            app.url = item.url
            app.target = ['_blank', '_self', '_parent', '_top'].includes(item.target)
              ? item.target
              : '_blank'
          } else if (item.path) {
            app.path = item.path
            app.active = activeRoutePath?.startsWith(app.path)
          } else {
            app.path = `/${item.id}`
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
    const updateLeftPortal = (newContent) => {
      contentOnLeftPortal.value = newContent.hasContent
    }

    return {
      contentOnLeftPortal,
      updateLeftPortal,
      isNotificationBellEnabled,
      userMenuItems,
      appMenuItems,
      logoWidth
    }
  },
  computed: {
    ...mapGetters(['configuration', 'user']),

    darkThemeAvailable() {
      return this.configuration.themes.default && this.configuration.themes['default-dark']
    },

    sidebarLogoAlt() {
      return this.$gettext('Navigate to personal files page')
    },

    logoImage() {
      return this.configuration.currentTheme.logo.topbar
    },

    isFeedbackLinkEnabled() {
      return !this.configuration?.options?.disableFeedbackLink
    },

    feedbackLinkOptions() {
      const feedback = this.configuration?.options?.feedbackLink
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
      image.src = this.configuration.currentTheme.logo.topbar
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
