<template>
  <div class="oc-login" uk-height-viewport>
    <div class="oc-login-card uk-position-center">
      <h1 v-translate class="oc-login-logo">
        ownCloud
      </h1>
      <div class="oc-login-card-body uk-width-large">
        <h3 class="oc-login-card-title">
          <span v-translate>Login Error</span>
        </h3>
        <h4 v-translate class="uk-margin-remove">
          You are not allowed to use this application.
        </h4>
        <br />
        <div v-translate class="uk-margin-remove" @click="performLogout">
          If you like to login with a different user please proceed to <a id="exitAnchor">exit</a>.
        </div>
        <br />
        <div v-translate class="uk-margin-remove">
          <strong>Attention:</strong> this will log you out from all applications you are running in
          this browser with your current user.
        </div>
      </div>
      <div class="oc-login-card-footer uk-width-large">
        <p>
          {{ helpDeskText }}
          <a v-if="helpDeskLink" :href="helpDeskLink" v-text="helpDeskLinkText" />
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'AccessDeniedPage',
  computed: {
    ...mapGetters(['configuration']),
    helpDeskText() {
      if (
        this.configuration.theme.general.helpDeskText &&
        this.configuration.theme.general.helpDeskText.en
      ) {
        const lang = this.$language.current
        if (this.configuration.theme.general.helpDeskText[lang]) {
          return this.configuration.theme.general.helpDeskText[lang]
        }
        return this.configuration.theme.general.helpDeskText.en
      }
      return this.$gettext(
        'Please contact your administrator if you think this message shows up in error.'
      )
    },
    helpDeskLink() {
      if (this.configuration.theme.general.helpDeskLink) {
        return this.configuration.theme.general.helpDeskLink
      }
      return ''
    },
    helpDeskLinkText() {
      if (this.configuration.theme.general.helpDeskLinkText) {
        return this.configuration.theme.general.helpDeskLinkText
      }
      return ''
    }
  },
  methods: {
    ...mapActions(['logout']),
    performLogout(event) {
      if (event.target.id === 'exitAnchor') {
        this.logout()
      }
    }
  }
}
</script>
