<template>
  <div id="Web" class="oc-height-1-1" :style="{ backgroundImage: 'url(' + backgroundImg + ')' }">
    <div class="oc-login oc-height-viewport">
      <div class="oc-login-card oc-position-center">
        <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
        <div class="oc-login-card-body">
          <h1 v-translate class="oc-login-card-title">Missing or invalid config</h1>
          <p v-translate>Please check if the file config.json exists and is correct.</p>
          <p v-translate>Also, make sure to check the browser console for more information.</p>
        </div>
        <div class="oc-login-card-footer">
          <p>
            <translate>For help visit our</translate>
            <a v-translate href="https://owncloud.dev/clients/web" target="_blank">documentation</a>
            <translate>or join our</translate>
            <a v-translate href="https://talk.owncloud.com/channel/web" target="_blank">chat</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getBackendVersion, getWebVersion } from '../container/versions'

export default {
  name: 'MissingConfigPage',

  computed: {
    ...mapGetters(['configuration']),

    backgroundImg() {
      return this.configuration.currentTheme.loginPage.backgroundImg
    },

    logoImg() {
      return this.configuration.currentTheme.logo.login
    },

    favicon() {
      return this.configuration.currentTheme.logo.favicon
    }
  },

  metaInfo() {
    const metaInfo = {}
    if (this.favicon) {
      metaInfo.link = [{ rel: 'icon', href: this.favicon }]
    }
    const metaGenerator = {
      name: 'generator',
      content: [getWebVersion(), getBackendVersion({ store: this.$store })]
        .filter(Boolean)
        .join(', ')
    }
    metaInfo.meta = [metaGenerator]
    return metaInfo
  }
}
</script>
