<template>
  <div class="oc-login" uk-height-viewport>
      <div class="oc-login-card uk-position-center">
          <h1 class="oc-login-logo" v-translate>
              ownCloud
          </h1>
          <div class="oc-login-card-body">
              <h3 class="oc-login-card-title">
                  <span v-translate>Login Error</span>
              </h3>
              <h4 v-translate>
                You are not allowed to use this application.
              </h4>
          </div>
          <div class="oc-login-card-footer">
              <p>{{ helpDeskText }}</p>
            <a v-if="helpDeskLink !== ''" :href="helpDeskLink">{{ helpDeskLinkText }}</a>
          </div>
      </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'AccessDeniedPage',
  computed: {
    ...mapGetters(['configuration']),
    helpDeskText () {
      if (this.configuration.theme.general.helpDeskText) {
        return this.configuration.theme.general.helpDeskText
      }
      return this.$gettext('Please contact your administrator if you think this message shows up in error.')
    },
    helpDeskLink () {
      if (this.configuration.theme.general.helpDeskLink) {
        return this.configuration.theme.general.helpDeskLink
      }
      return ''
    },
    helpDeskLinkText () {
      if (this.configuration.theme.general.helpDeskLinkText) {
        return this.configuration.theme.general.helpDeskLinkText
      }
      return ''
    }
  }
}
</script>
