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
import { useStore } from '@ownclouders/web-pkg'
import { useHead } from '../composables/head'

export default defineComponent({
  name: 'MissingConfigPage',
  setup() {
    const store = useStore()

    const logoImg = computed(() => {
      return store.getters.configuration?.currentTheme?.logo?.login
    })
    const footerSlogan = computed(() => {
      return store.getters.configuration?.currentTheme?.general?.slogan
    })

    useHead({ store })

    return {
      logoImg,
      footerSlogan
    }
  }
})
</script>
