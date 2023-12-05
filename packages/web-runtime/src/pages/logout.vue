<template>
  <div class="oc-login-card oc-position-center">
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
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useRouter, useThemeStore } from '@ownclouders/web-pkg'
import { authService } from 'web-runtime/src/services/auth'
import { useGettext } from 'vue3-gettext'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'LogoutPage',
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()
    const themeStore = useThemeStore()

    const { currentTheme } = storeToRefs(themeStore)

    authService.logoutUser().then(() => {
      router.push({ name: 'login' })
    })

    const cardTitle = computed(() => {
      return $gettext('Logout in progress')
    })
    const cardHint = computed(() => {
      return $gettext("Please wait while you're being logged out.")
    })

    const footerSlogan = computed(() => currentTheme.value.common.slogan)
    const logoImg = computed(() => currentTheme.value.logo.login)

    return {
      logoImg,
      cardTitle,
      cardHint,
      footerSlogan
    }
  }
})
</script>
