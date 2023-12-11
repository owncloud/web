<template>
  <div
    class="loading-overlay oc-flex oc-flex-middle oc-flex-center"
    :style="{
      backgroundImage: 'url(' + currentTheme.loginPage.backgroundImg + ')'
    }"
  >
    <oc-spinner size="xlarge" :aria-label="$gettext('Loading')" />
  </div>
</template>
<script lang="ts">
import { useThemeStore } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingLayout',
  setup() {
    const themeStore = useThemeStore()
    const { currentTheme } = storeToRefs(themeStore)

    return {
      currentTheme
    }
  }
})
</script>
<style lang="scss">
.loading-overlay {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 100%;
  width: 100%;

  .oc-spinner {
    color: #0a264e;
    display: inline-block;

    &::after {
      border: 10px solid;
      border-bottom: 10px solid transparent;
    }
  }
}
</style>
