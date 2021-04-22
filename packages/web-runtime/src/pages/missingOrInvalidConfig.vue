<template>
  <div id="Web" class="uk-height-1-1" :style="{ backgroundImage: 'url(' + backgroundImg + ')' }">
    <div class="oc-login" uk-height-viewport>
      <div class="oc-login-card uk-position-center">
        <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
        <div class="oc-login-card-body">
          <h1 class="oc-login-card-title">
            <span v-translate>Missing or invalid config</span>
          </h1>
          <p v-translate>
            Please check if the file config.json exists and is correct.<br />
            Check the console for more information.
          </p>
        </div>
        <div class="oc-login-card-footer">
          <p>
            <!-- Until we have documentation for Web let's point this link to Web repo -->
            <translate>For help visit our</translate>
            <translate tag="a" href="https://github.com/owncloud/web" target="_blank"
              >documentation</translate
            >.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MissingConfigPage',

  computed: {
    ...mapGetters(['configuration']),

    backgroundImg() {
      return this.configuration.theme.loginPage.backgroundImg
    },

    logoImg() {
      return this.configuration.theme.logo.login
    }
  }
}
</script>
