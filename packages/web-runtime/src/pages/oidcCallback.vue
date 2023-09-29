<template>
  <div class="oc-login-card oc-position-center">
    <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
    <div v-show="error" class="oc-login-card-body">
      <h2 v-translate class="oc-login-card-title">Authentication failed</h2>
      <p v-translate>Please contact the administrator if this error persists.</p>
    </div>
    <div v-show="!error" class="oc-login-card-body">
      <h3 v-translate class="oc-login-card-title">Logging you in</h3>
      <p v-translate>Please wait, you are being redirected.</p>
    </div>
    <div class="oc-login-card-footer oc-pt-rm">
      <p>{{ footerSlogan }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, unref } from 'vue'
import { useRoute, useStore } from '@ownclouders/web-pkg'
import { authService } from 'web-runtime/src/services/auth'

export default defineComponent({
  name: 'OidcCallbackPage',
  setup() {
    const store = useStore()

    const error = ref(false)

    const logoImg = computed(() => {
      return store.getters.configuration.currentTheme.logo.login
    })
    const footerSlogan = computed(() => {
      return store.getters.configuration.currentTheme.general.slogan
    })

    const route = useRoute()
    onMounted(() => {
      if (unref(route).query.error) {
        error.value = true
        console.warn(
          `OAuth error: ${unref(route).query.error} - ${unref(route).query.error_description}`
        )
        return
      }

      if (unref(route).path === '/oidc-silent-redirect') {
        authService.signInSilentCallback()
      } else {
        authService.signInCallback()
      }
    })

    return {
      error,
      logoImg,
      footerSlogan
    }
  }
})
</script>
