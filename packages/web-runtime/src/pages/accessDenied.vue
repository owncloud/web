<template>
  <div
    class="oc-login oc-height-viewport"
    :style="{ backgroundImage: 'url(' + backgroundImg + ')' }"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <div class="oc-login-card-wrapper oc-height-viewport oc-flex oc-flex-center oc-flex-middle">
      <div class="oc-login-card">
        <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
        <div class="oc-login-card-body oc-width-medium">
          <h2 class="oc-login-card-title" v-text="cardTitle" />
          <p v-text="cardHint" />
        </div>
      </div>
      <oc-button
        id="exitAnchor"
        type="router-link"
        class="oc-mt-m oc-width-medium"
        :to="{ name: 'login' }"
        size="large"
        appearance="filled"
        variation="primary"
        v-text="navigateToLoginText"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { mapGetters } from 'vuex'

export default defineComponent({
  name: 'AccessDeniedPage',
  computed: {
    ...mapGetters(['configuration']),
    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },
    cardTitle() {
      return this.$gettext('Logged out')
    },
    cardHint() {
      return this.$gettext('You were automatically logged out for security reasons.')
    },
    navigateToLoginText() {
      return this.$gettext('Log in again')
    },
    logoImg() {
      return this.configuration.currentTheme.logo.login
    },
    backgroundImg() {
      return this.configuration.currentTheme.loginPage.backgroundImg
    }
  }
})
</script>

<style lang="scss" scoped>
.oc-login-card-wrapper {
  flex-flow: column;
}
</style>
