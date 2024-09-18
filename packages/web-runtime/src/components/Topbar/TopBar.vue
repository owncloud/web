<template>
  <header
    id="oc-topbar"
    :class="{ 'open-app': contentOnLeftPortal }"
    :aria-label="$gettext('Top bar')"
  >
    <div class="oc-topbar-left oc-flex oc-flex-middle oc-flex-start">
      <applications-menu
        v-if="appMenuExtensions.length && !isEmbedModeEnabled"
        :menu-items="appMenuExtensions"
      />
      <router-link v-if="!hideLogo" ref="navigationSidebarLogo" :to="homeLink" class="oc-width-1-1">
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
        <user-menu />
      </portal>
    </template>
    <portal-target name="app.runtime.header.left" @change="updateLeftPortal" />
  </header>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { computed, unref, PropType, ref, onMounted } from 'vue'
import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'
import FeedbackLink from './FeedbackLink.vue'
import SideBarToggle from './SideBarToggle.vue'
import {
  ApplicationInformation,
  AppMenuItemExtension,
  CustomComponentTarget,
  useAuthStore,
  useCapabilityStore,
  useConfigStore,
  useEmbedMode,
  useExtensionRegistry,
  useOpenEmptyEditor,
  useRouter,
  useThemeStore
} from '@ownclouders/web-pkg'
import { isRuntimeRoute } from '../../router'
import { appMenuExtensionPoint, topBarCenterExtensionPoint } from '../../extensionPoints'

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
    const extensionRegistry = useExtensionRegistry()
    const { openEmptyEditor } = useOpenEmptyEditor()

    const authStore = useAuthStore()
    const router = useRouter()
    const { isEnabled: isEmbedModeEnabled } = useEmbedMode()

    const appMenuExtensions = computed(() => {
      return extensionRegistry.requestExtensions(appMenuExtensionPoint)
    })

    const logoWidth = ref('150px')
    const hideLogo = computed(() => unref(configOptions).hideLogo)

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

    const contentOnLeftPortal = ref(false)
    const updateLeftPortal = (newContent: { hasContent: boolean; sources: string[] }) => {
      contentOnLeftPortal.value = newContent.hasContent
    }

    onMounted(() => {
      // FIXME: backwards compatibility for the deprecated applicationMenu prop
      const navExtensions = props.applicationsList
        .filter((app) => app.applicationMenu?.enabled())
        .map((app) => ({
          id: app.id,
          type: 'appMenuItem',
          label: () => app.name,
          path: `/${app.id}`,
          icon: app.icon,
          color: app.color,
          extensionPointIds: [appMenuExtensionPoint.id],
          priority: app.applicationMenu?.priority || 50,
          ...((app as any).url && { url: (app as any).url, target: '_blank' }),
          ...(app.applicationMenu?.openAsEditor && {
            handler: () => openEmptyEditor(app.id, app.defaultExtension)
          })
        })) as AppMenuItemExtension[]

      extensionRegistry.registerExtensions(computed(() => navExtensions))
    })

    return {
      configOptions,
      contentOnLeftPortal,
      currentTheme,
      updateLeftPortal,
      isNotificationBellEnabled,
      hideLogo,
      logoWidth,
      isEmbedModeEnabled,
      isSideBarToggleVisible,
      isSideBarToggleDisabled,
      homeLink,
      topBarCenterExtensionPoint,
      appMenuExtensions
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
