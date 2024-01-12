<template>
  <div class="oc-login-card oc-position-center">
    <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
    <div class="oc-login-card-body">
      <h1 v-translate class="oc-login-card-title">Missing or invalid config</h1>
      <p v-translate>Please check if the file config.json exists and is correct.</p>
      <p v-translate>Also, make sure to check the browser console for more information.</p>
    </div>
    <div class="oc-login-card-footer">
      <p>
        <span v-text="$gettext('For help visit our')" />
        <a v-translate href="https://owncloud.dev/clients/web" target="_blank">documentation</a>
        <span v-text="$gettext('or join our')" />
        <a v-translate href="https://talk.owncloud.com/channel/web" target="_blank">chat</a>.
      </p>
      <p>
        {{ footerSlogan }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useThemeStore } from '@ownclouders/web-pkg'
import { useHead } from '../composables/head'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'MissingConfigPage',
  setup() {
    const themeStore = useThemeStore()
    const { currentTheme } = storeToRefs(themeStore)

    const logoImg = computed(() => currentTheme.value.logo.login)
    const footerSlogan = computed(() => currentTheme.value.common.slogan)

    useHead()

    return {
      logoImg,
      footerSlogan
    }
  }
})
</script>
