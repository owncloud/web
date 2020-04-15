<template>
  <div>
    <oc-button
      id="_userMenuButton"
      ref="menuButton"
      class="oc-topbar-personal uk-height-1-1"
      variation="primary"
      :aria-label="$gettext('User Menu')"
    >
      <oc-grid gutter="small">
        <avatar-image
          class="oc-topbar-personal-avatar"
          :width="32"
          :userid="userId"
          :user-name="userDisplayName"
        />
        <div class="oc-topbar-personal-label">{{ userDisplayName }}</div>
      </oc-grid>
    </oc-button>
    <oc-drop
      ref="menu"
      toggle="#_userMenuButton"
      mode="click"
      :options="{ pos: 'bottom-right' }"
      class="uk-width-large"
    >
      <div id="account-info-container" class="uk-card-body uk-flex uk-flex-middle uk-flex-column">
        <avatar-image :userid="userId" :user-name="userDisplayName" :width="128" />
        <h3 class="uk-card-title">{{ userDisplayName }}</h3>
        <span v-if="userEmail">{{ userEmail }}</span>
        <router-link to="/account" target="_blank"
          ><translate>Manage your account</translate></router-link
        >
        <br />
        <oc-button id="logoutMenuItem" type="a" @click="logout()"
          ><translate>Log out</translate></oc-button
        >
      </div>
      <div class="uk-card-footer uk-flex uk-flex-middle uk-flex-column">
        <span
          >Version: {{ appVersion.version }}-{{ appVersion.hash }} ({{
            appVersion.buildDate
          }})</span
        >
      </div>
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
<style scoped>
/* FIXME: https://github.com/owncloud/owncloud-design-system/issues/596 */
.oc-topbar-personal-avatar {
  margin-top: 3px;
}
.oc-topbar-personal-label {
  margin-left: 0px !important;
}
</style>
