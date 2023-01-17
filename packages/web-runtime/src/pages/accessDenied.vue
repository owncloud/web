<template>
  <div class="oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle">
    <div class="oc-login-card">
      <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
      <div class="oc-login-card-body oc-width-medium">
        <h2 class="oc-login-card-title" v-text="cardTitle" />
        <p v-text="cardHint" />
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
    const cardTitle = computed(() => {
      return $gettext('Logged out')
    })
    const cardHint = computed(() => {
      return $gettext('You were automatically logged out for security reasons.')
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
      navigateToLoginText
    }
  }
})
</script>
