<template>
  <header
    id="oc-topbar"
    class="oc-flex oc-flex-middle oc-flex-between oc-px-m"
    :aria-label="$gettext('Top bar')"
  >
    <div class="oc-topbar-left oc-flex oc-flex-middle oc-flex-between">
      <applications-menu v-if="appMenuItems.length" :applications-list="appMenuItems" />
      <router-link ref="navigationSidebarLogo" to="/">
        <oc-img :src="logoImage" :alt="sidebarLogoAlt" class="oc-logo-image" />
      </router-link>
      <open-file-bar v-if="openResource" :resource="openResource" @close="closeAppFile" />
      <portal-target name="app.runtime.header.left" @change="updateLeftPortal"></portal-target>
    </div>
    <div v-if="showMiddleSlot" class="portal-wrapper">
      <portal-target name="app.runtime.header" multiple></portal-target>
    </div>
    <div class="oc-topbar-right oc-flex oc-flex-middle oc-flex-between">
      <portal-target name="app.runtime.header.right" multiple />
    </div>
    <portal to="app.runtime.header.right" :order="50">
      <theme-switcher v-if="darkThemeAvailable" />
      <feedback-link v-if="isFeedbackLinkEnabled" v-bind="feedbackLinkOptions" />
    </portal>
    <portal to="app.runtime.header.right" :order="100">
      <notifications v-if="isNotificationBellEnabled" />
      <user-menu v-if="isUserMenuEnabled" :applications-list="userMenuItems" />
    </portal>
  </header>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapState } from 'vuex'
import NavigationMixin from '../../mixins/navigationMixin'

import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'
import FeedbackLink from './FeedbackLink.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useCapabilityNotifications } from 'web-pkg/src'
import { computed, unref } from 'vue'
import OpenFileBar from './OpenFileBar.vue'
import { useAppDefaults } from 'web-pkg/src/composables'

export default {
  components: {
    ApplicationsMenu,
    FeedbackLink,
    Notifications,
    ThemeSwitcher,
    UserMenu,
    OpenFileBar
  },
  mixins: [NavigationMixin],
  props: {
    applicationsList: {
      type: Array,
      required: false,
      default: () => []
    },
    activeNotifications: {
      type: [Array, Boolean],
      required: false,
      default: () => []
    }
  },
  setup() {
    const notificationsSupport = useCapabilityNotifications()

    const isNotificationBellEnabled = computed(() => {
      return unref(notificationsSupport).includes('list')
    })

    return {
      isNotificationBellEnabled,
      ...useAppDefaults({
        applicationId: 'files'
      })
    }
  },
  data: function () {
    return {
      contentOnLeftPortal: false,
      openResource: null
    }
  },
  computed: {
    ...mapState(['apps']),
    ...mapGetters(['configuration', 'user']),
    ...mapGetters('Files', ['currentFolder']),

    showMiddleSlot() {
      return !this.contentOnLeftPortal
    },

    activeRoutePath() {
      return this.$router.resolve(this.$route).path
    },

    appMenuItems() {
      return this.navigation_getMenuItems([null, 'apps', 'appSwitcher'], this.activeRoutePath)
    },
    userMenuItems() {
      return this.navigation_getMenuItems(['user'], this.activeRoutePath)
    },

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
    },

    isUserMenuEnabled() {
      return this.user?.id
    }
  },
  mounted() {
    this.checkFileOpen(this.$route)
    this.$watch('$route', (to, from) => {
      if (to.name !== from?.name) {
        this.checkFileOpen(to)
      }
    })

    this.$watch('currentFileContext', (to, from) => {
      if (to.path !== from.path) {
        this.checkFileOpen(this.$route)
      }
    })
  },

  methods: {
    ...mapActions('Files', ['setOpenedFile']),
    updateLeftPortal(newContent, oldContent) {
      this.contentOnLeftPortal = newContent
    },
    closeAppFile() {
      this.openResource = null
      this.closeApp()
    },
    checkFileOpen(route) {
      this.openResource = null
      if (
        route &&
        this.isFileEditorOpen(route) &&
        this.currentFileContext?.path &&
        !(this.currentFileContext.path === '/' || this.currentFileContext.item === '/')
      ) {
        this.getOpenResource()
      }
    },
    isFileEditorOpen(route) {
      return (
        route.name === 'external-apps' ||
        this.apps.fileEditors.some((e) => route.path.startsWith('/' + e.app))
      )
    },
    async getOpenResource() {
      try {
        this.loading = true
        this.openResource = await this.getFileInfo(this.currentFileContext)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style lang="scss">
#oc-topbar {
  height: 52px;
  position: sticky;
  z-index: 5;

  .portal-wrapper {
    @media (max-width: 639px) {
      margin-left: auto;
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
    gap: 30px;

    img.oc-logo-image {
      height: 38px;
    }
  }
  .oc-topbar-right {
    gap: 20px;
  }
  @media only screen and (max-width: 960px) {
    .oc-topbar-left,
    .oc-topbar-right {
      gap: 0.5rem;
    }
  }
}
</style>
