<template>
  <div v-if="userId">
    <oc-button
      id="_userMenuButton"
      ref="menuButton"
      class="oc-topbar-personal uk-height-1-1 oc-pr-xs"
      variation="raw"
      :aria-label="$gettext('User Menu')"
    >
      <oc-grid flex>
        <avatar-image
          class="oc-topbar-personal-avatar uk-flex-inline uk-flex-center uk-flex-middle"
          :width="24"
          :userid="userId"
          :user-name="userDisplayName"
        />
        <div
          class="oc-topbar-personal-label uk-text-primary oc-text-bold oc-ml-rm"
          v-text="userDisplayName"
        />
      </oc-grid>
    </oc-button>
    <oc-drop
      ref="menu"
      drop-id="account-info-container"
      toggle="#_userMenuButton"
      mode="click"
      close-on-click
      :options="{ pos: 'bottom-right', delayHide: 0 }"
      class="uk-width-auto"
    >
      <ul class="uk-list">
        <li class="uk-text-nowrap">
          <oc-button
            id="oc-topbar-account-manage"
            type="router-link"
            :to="{ path: '/account' }"
            variation="raw"
            gap-size="xsmall"
            justify-content="left"
          >
            <oc-icon name="portrait" />
            <translate>Profile</translate>
          </oc-button>
        </li>
        <li v-for="(n, nid) in menuItems" :key="`user-menu-${nid}`">
          <oc-button
            v-if="n.url"
            type="a"
            variation="raw"
            gap-size="xsmall"
            justify-content="left"
            :target="n.target"
            :href="n.url"
          >
            <oc-icon v-if="n.iconMaterial" :name="n.iconMaterial" />
            <oc-icon v-if="n.iconUrl" :url="n.iconUrl" />
            <span>{{ n.title }}</span>
          </oc-button>
          <oc-button
            v-else
            type="router-link"
            variation="raw"
            gap-size="xsmall"
            justify-content="left"
            :to="{ path: n.path }"
          >
            <oc-icon v-if="n.iconMaterial" :name="n.iconMaterial" />
            <oc-icon v-if="n.iconUrl" :url="n.iconUrl" />
            <span v-text="n.title" />
          </oc-button>
        </li>
        <li>
          <oc-button
            id="oc-topbar-account-logout"
            variation="raw"
            gap-size="xsmall"
            justify-content="left"
            @click="logout"
          >
            <oc-icon name="exit_to_app" />
            <translate>Log out</translate>
          </oc-button>
        </li>
      </ul>
    </oc-drop>
  </div>
</template>

<script>
import { version } from '../../package.json'
import NavigationMixin from '../mixins/navigationMixin'

export default {
  mixins: [NavigationMixin],
  props: {
    userId: {
      type: String,
      required: true
    },
    userDisplayName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: false,
      default: null
    },
    applicationsList: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      appVersion: version
    }
  },
  computed: {
    menuItems() {
      return this.navigation_getMenuItems(['user'])
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.focusFirstLink()
      } else {
        this.$emit('closed')
      }
    }
  },
  methods: {
    logout() {
      this.visible = false
      // Use timeout to leave enough time for the dropdown to be hidden
      setTimeout(() => {
        this.$store.dispatch('logout')
      })
    },
    focusFirstLink() {
      /*
       * Delay for two reasons:
       * - for screen readers Virtual buffer
       * - to outsmart uikit's focus management
       */
      setTimeout(() => {
        this.$refs.menuButton.$el.querySelector('a:first-of-type').focus()
      }, 500)
    }
  }
}
</script>
