<template>
  <div>
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
          <router-link id="oc-topbar-account-manage" v-translate to="/account"
            >Manage your account</router-link
          >
        </li>
        <li>
          <router-link
            id="oc-topbar-account-logout"
            v-translate
            to="/"
            @click.native.prevent="logout"
            >Log out</router-link
          >
        </li>
      </ul>
    </oc-drop>
  </div>
</template>

<script>
import appVersionJson from '../../build/version.json'

export default {
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
    }
  },
  data() {
    return {
      appVersion: appVersionJson
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
      this.$store.dispatch('logout')
    },
    openItem(url) {
      if (url) {
        const win = window.open(url, '_blank')
        if (win) {
          win.focus()
        }
      }
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
