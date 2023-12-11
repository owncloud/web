<template>
  <div class="oc-width-1-1 oc-height-1-1">
    <app-loading-spinner v-if="autoRedirect" />
    <div v-else class="oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle">
      <div class="oc-login-card">
        <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
        <div class="oc-login-card-body oc-width-medium">
          <h2 class="oc-login-card-title">
            <span v-text="$gettext('Welcome to %{productName}', { productName })" />
          </h2>
          <p v-translate>
            Please click the button below to authenticate and get access to your data.
          </p>
        </div>
        <div class="oc-login-card-footer oc-pt-rm">
          <p>{{ footerSlogan }}</p>
        </div>
      </div>
      <oc-button
        id="authenticate"
        size="large"
        variation="primary"
        appearance="filled"
        class="oc-mt-m oc-width-medium oc-login-authorize-button"
        @click="performLogin"
      >
        <span v-text="$gettext('Login')" />
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { authService } from '../services/auth'
import { queryItemAsString, useRouteQuery, useThemeStore } from '@ownclouders/web-pkg'
import { computed, defineComponent, unref } from 'vue'
import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'LoginPage',
  components: {
    AppLoadingSpinner
  },
  setup() {
    const themeStore = useThemeStore()
    const { currentTheme } = storeToRefs(themeStore)

    const redirectUrl = useRouteQuery('redirectUrl')
    const performLogin = () => {
      authService.loginUser(queryItemAsString(unref(redirectUrl)))
    }
    const autoRedirect = computed(() => currentTheme.value.loginPage.autoRedirect)
    if (unref(autoRedirect)) {
      performLogin()
    }

    const productName = computed(() => currentTheme.value.common.name)
    const logoImg = computed(() => currentTheme.value.logo.login)
    const footerSlogan = computed(() => currentTheme.value.common.slogan)

    return {
      autoRedirect,
      productName,
      logoImg,
      footerSlogan,
      performLogin
    }
  }
})
</script>
