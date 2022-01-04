<template>
  <nav v-if="userId" :aria-label="$gettext('Account menu')">
    <oc-button
      id="_userMenuButton"
      ref="menuButton"
      class="oc-topbar-personal uk-height-1-1"
      appearance="raw"
      variation="inverse"
      :aria-label="$gettext('User Menu')"
    >
      <avatar-image
        class="oc-topbar-personal-avatar uk-flex-inline uk-flex-center uk-flex-middle"
        :width="24"
        :userid="userId"
        :user-name="userDisplayName"
      />
      <div class="oc-topbar-personal-label oc-text-bold oc-visible@s" v-text="userDisplayName" />
    </oc-button>
    <oc-drop
      ref="menu"
      drop-id="account-info-container"
      toggle="#_userMenuButton"
      mode="click"
      close-on-click
      :options="{ pos: 'bottom-right', delayHide: 0 }"
      class="uk-width-auto"
      padding-size="small"
    >
      <ul class="uk-list">
        <li class="uk-text-nowrap">
          <oc-button
            id="oc-topbar-account-manage"
            type="router-link"
            :to="{ path: '/account' }"
            appearance="raw"
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
            appearance="raw"
            gap-size="xsmall"
            justify-content="left"
            :target="n.target"
            :href="n.url"
          >
            <oc-icon :name="n.iconMaterial" />
            <translate>{{ n.title }}</translate>
          </oc-button>
          <oc-button
            v-else
            type="router-link"
            appearance="raw"
            gap-size="xsmall"
            justify-content="left"
            :to="{ path: n.path }"
          >
            <oc-icon :name="n.iconMaterial" />
            <translate>{{ n.title }}</translate>
          </oc-button>
        </li>
        <li>
          <oc-button
            id="oc-topbar-account-logout"
            appearance="raw"
            gap-size="xsmall"
            justify-content="left"
            @click="logout"
          >
            <oc-icon name="sign-out" />
            <translate>Log out</translate>
          </oc-button>
        </li>
      </ul>
    </oc-drop>
  </nav>
</template>

<script>
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
    applicationsList: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  computed: {
    menuItems() {
      return this.navigation_getMenuItems(['user'])
    }
  },
  mounted() {
    this.$refs.menu.tippy.setProps({
      onHidden: () => this.$refs.menuButton.$el.focus(),
      onShown: () => this.$refs.menu.$el.querySelector('a:first-of-type').focus()
    })
  },
  methods: {
    logout() {
      // Use timeout to leave enough time for the dropdown to be hidden
      setTimeout(() => {
        this.$store.dispatch('logout')
      })
    }
  }
}
</script>
