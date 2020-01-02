<template>
  <div>
    <oc-button id="_userMenuButton" class="oc-topbar-personal uk-height-1-1" variation="primary" aria-label="$gettext('User Menu')" ref="menuButton">
      <avatar type="span" class="oc-topbar-personal-avatar" :userid="userId" />
      <span class="oc-topbar-personal-label">{{ userDisplayName }}</span>
    </oc-button>
    <oc-drop toggle="#_userMenuButton" mode="click" :options="{pos:'bottom-right'}" class="uk-width-large" ref="menu">
      <div class="uk-card-body uk-flex uk-flex-middle uk-flex-column" id="account-info-container">
        <avatar
          :userid="userId"
          :width="128"
        />
        <h3 class="uk-card-title">{{ userDisplayName }}</h3>
        <span v-if="userEmail">{{ userEmail }}</span>
        <router-link to="/account" target="_blank"><translate>Manage your account</translate></router-link>
        <br/>
        <oc-button id="logoutMenuItem" type="a" @click="logout()"><translate>Log out</translate></oc-button>
      </div>
      <div class="uk-card-footer uk-flex uk-flex-middle uk-flex-column">
        <span>Version: {{appVersion.version}}-{{appVersion.hash}} ({{appVersion.buildDate}})</span>
      </div>
    </oc-drop>
  </div>
</template>

<script>
import appVersionJson from '../../build/version.json'
import Avatar from './Avatar.vue'

export default {
  components: {
    Avatar
  },
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
  data () {
    return {
      appVersion: appVersionJson
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.focusFirstLink()
      } else {
        this.$emit('closed')
      }
    }
  },
  methods: {
    logout () {
      this.visible = false
      this.$store.dispatch('logout')
    },
    openItem (url) {
      if (url) {
        const win = window.open(url, '_blank')
        if (win) {
          win.focus()
        }
      }
    },
    focusFirstLink () {
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
