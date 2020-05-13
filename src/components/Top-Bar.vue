<template>
  <header
    id="oc-topbar"
    class="uk-flex uk-flex-middle uk-flex-wrap oc-border-bottom uk-padding-small"
  >
    <oc-grid v-if="!publicPage()" gutter="large" flex>
      <div class="uk-hidden@l">
        <oc-button
          variation="raw"
          class="oc-app-navigation-toggle"
          :aria-label="$gettext('Open navigation menu')"
          @click="toggleAppNavigationVisibility"
        >
          <oc-icon name="menu" class="uk-flex" aria-hidden="true" />
        </oc-button>
      </div>
      <search-bar />
    </oc-grid>
    <oc-grid
      v-if="!isPublicPage"
      flex
      gutter="small"
      class="uk-width-expand uk-flex-right uk-margin-remove-top"
    >
      <notifications v-if="activeNotifications.length" />
      <applications-menu v-if="applicationsList.length > 0" :applications-list="applicationsList" />
      <user-menu :user-id="userId" :user-display-name="userDisplayName" />
    </oc-grid>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import pluginHelper from '../mixins/pluginHelper.js'
import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'
import SearchBar from './SearchBar.vue'

export default {
  components: {
    Notifications,
    ApplicationsMenu,
    UserMenu,
    SearchBar
  },
  mixins: [pluginHelper],
  props: {
    userId: {
      type: String,
      required: false,
      default: null
    },
    userDisplayName: {
      type: String,
      required: false,
      default: null
    },
    applicationsList: {
      type: Array,
      required: false,
      default: () => null
    },
    hasAppNavigation: {
      type: Boolean,
      required: false,
      default: false
    },
    activeNotifications: {
      type: [Array, Boolean],
      required: false,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['apps']),

    isPublicPage() {
      return !this.userId
    },

    currentExtensionName() {
      if (this.apps[this.currentExtension]) {
        return this.$gettext(this.apps[this.currentExtension].name)
      }
      return this.currentExtension
    }
  },
  methods: {
    toggleAppNavigationVisibility() {
      this.$emit('toggleAppNavigationVisibility')
    }
  }
}
</script>

<style scoped>
.topbar-current-extension-title {
  color: white;
}
</style>
