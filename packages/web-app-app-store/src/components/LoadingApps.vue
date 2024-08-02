<template>
  <div class="app-loader oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle">
    <div class="oc-card oc-text-center oc-width-large">
      <div class="oc-card-header">
        <h2 v-text="$gettext('Loading apps…')" />
      </div>
      <div class="oc-card-body">
        <p v-text="$gettext(`Please wait a moment while we're loading all apps.`)"></p>
      </div>
      <div class="oc-card-footer oc-pt-rm">
        <p>{{ footerSlogan }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useThemeStore } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export default defineComponent({
  setup() {
    const themeStore = useThemeStore()

    const { currentTheme } = storeToRefs(themeStore)
    const footerSlogan = computed(() => currentTheme.value.common.slogan)

    return {
      footerSlogan
    }
  }
})
</script>

<style lang="scss">
.app-loader {
  .oc-card {
    background: var(--oc-color-background-highlight);
    border-radius: 15px;
  }

  .oc-text-input-message {
    justify-content: center;
  }

  .oc-card-header h2 {
    margin: 0;
  }
}
</style>
