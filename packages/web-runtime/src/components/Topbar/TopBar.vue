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
    </div>
    <div class="portal-wrapper">
      <portal-target name="app.runtime.header" multiple></portal-target>
    </div>
    <div class="oc-topbar-right oc-flex oc-flex-middle oc-flex-between">
      <tours />
      <!-- <feedback-link v-if="isFeedbackLinkEnabled" v-bind="feedbackLinkOptions" /> -->

      <theme-switcher v-if="darkThemeAvailable" />
      <template v-if="cernFeatures">
        <oc-button id="oc-topbar-account-links" appearance="raw" variation="inverse" :aria-label="helpButtonLabel">
          <oc-icon name="questionnaire" />
        </oc-button>
        <oc-drop
          id="links"
          drop-id="links"
          toggle="#oc-topbar-account-links"
          mode="hover"
          close-on-click
          padding-size="small"
          class="oc-width-auto"
        >
          <oc-list
            ><li class="oc-menu-item-hover">
              <oc-button
                type="a"
                appearance="raw"
                href="https://cernbox.docs.cern.ch/"
                target="_blanc"
              >
                <oc-icon :name="'book-2'" fill-type="line" class="oc-p-xs" />
                <translate>CERNBox documentation</translate>
              </oc-button>
            </li>
            <li class="oc-menu-item-hover">
              <oc-button
                type="a"
                appearance="raw"
                href="https://cern.service-now.com/service-portal?id=sc_cat_item&name=cernbox-feedback&se=CERNBox-Service&cernbox_service_instance=Production"
                target="_blanc"
              >
                <oc-icon :name="'feedback'" fill-type="line" class="oc-p-xs" />
                <translate>Give us feedback</translate>
              </oc-button>
            </li>
            <li class="oc-menu-item-hover">
              <oc-button
                type="a"
                appearance="raw"
                href="https://cern.service-now.com/service-portal?id=service_element&name=CERNBox-Service"
                target="_blanc"
              >
                <oc-icon :name="'questionnaire'" fill-type="line" class="oc-p-xs" />
                <translate>Open support ticket</translate>
              </oc-button>
            </li>
            <li class="oc-menu-item-hover">
              <oc-button
                type="a"
                appearance="raw"
                href="https://cernbox.web.cern.ch/cernbox/downloads/"
                target="_blanc"
              >
                <oc-icon :name="'computer'" fill-type="line" class="oc-p-xs" />
                <translate>CERNBOX clients</translate>
              </oc-button>
            </li>
          </oc-list>
        </oc-drop></template
      >
      <notifications v-if="isNotificationBellEnabled" />
      <user-menu v-if="isUserMenuEnabled" :applications-list="userMenuItems" />
    </div>
  </header>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import NavigationMixin from '../../mixins/navigationMixin'

import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'
import FeedbackLink from './FeedbackLink.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import Tours from './Tours/Tours.vue'
import OpenFileBar from './OpenFileBar.vue'
import { useAppDefaults } from 'web-pkg/src/composables'

export default {
  components: {
    ApplicationsMenu,
    FeedbackLink,
    Notifications,
    ThemeSwitcher,
    UserMenu,
    Tours,
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
    return {
      ...useAppDefaults({
        applicationId: 'files'
      })
    }
  },
  data: function () {
    return {
      openResource: null
    }
  },

  computed: {
    ...mapGetters(['configuration', 'user']),
    ...mapGetters('Files', ['openedFile']),

    helpButtonLabel() {
      return this.$gettext('Show service links')
    },
    cernFeatures() {
      return !!this.configuration?.options?.cernFeatures
    },

    activeRoutePath() {
      return this.$router.resolve(this.$route).location.path
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

    isNotificationBellEnabled() {
      return this.user?.id && this.activeNotifications.length
    },

    isUserMenuEnabled() {
      return this.user?.id
    }
  },
  created() {
    this.filePath = this.currentFileContext.path
    if (this.user.id !== this.currentFileContext.fileName) this.getOpenResource(this.filePath)
  },

  mounted() {
    this.$watch('currentFileContext.path', (to, from) => {
      if (to) {
        if (to !== from) {
          this.openResource = null
          if (this.user.id !== this.currentFileContext.fileName) this.getOpenResource(to)
        }
      }
    })
  },
  methods: {
    ...mapActions('Files', ['setOpenedFile']),
    closeAppFile() {
      this.openResource = null
      this.closeApp()
    },
    async getOpenResource(path) {
      try {
        this.loading = true
        this.openResource = await this.getFileResource(path)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style lang="scss">
#links {
  li {
    border: 1px solid transparent;

    a {
      gap: 10px;
      justify-content: left;
      width: 100%;
    }
  }
}
#oc-topbar {
  height: 52px;
  position: sticky;
  z-index: 5;

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
  @media only screen and (max-width: 1024px) {
    .oc-topbar-left,
    .oc-topbar-right {
      gap: 0.5rem;
    }
  }
}
</style>
