<template>
  <div class="oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle">
    <div class="oc-login-card">
      <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
      <div class="oc-login-card-body oc-width-medium">
        <h2 class="oc-login-card-title" v-text="cardTitle" />
        <p v-text="cardHint" />
        <oc-button
          v-if="loggedOutHelpUrl"
          type="a"
          appearance="raw"
          :href="loggedOutHelpUrl"
          target="_blank"
          ><span v-text="$gettext('More')"
        /></oc-button>
      </div>
      <div class="oc-login-card-footer oc-pt-rm">
        <p>
          {{ footerSlogan }}
        </p>
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
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'AccessDeniedPage',
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()

    const logoImg = computed(() => {
      return store.getters.configuration.currentTheme.logo.login
    })

    const loggedOutHelpUrl = computed(() => {
      return (
        store.getters.configuration.commonTheme.loggedOutHelpUrl ||
        store.getters.configuration.options.loggedOutHelpUrl
      )
    })
    const cardTitle = computed(() => {
      return $gettext('Not logged in')
    })
    const cardHint = computed(() => {
      return $gettext(
        'This could be because of a routine safety log out, or because your account is either inactive or not yet authorized for use. Please try logging in after a while or seek help from your Administraton.'
      )
    })
    const footerSlogan = computed(() => {
      return store.getters.configuration.currentTheme.general.slogan
    })
    const navigateToLoginText = computed(() => {
      return $gettext('Log in again')
    })

    return {
      logoImg,
      cardTitle,
      cardHint,
      footerSlogan,
      navigateToLoginText,
      loggedOutHelpUrl
    }
  }
})
</script>
