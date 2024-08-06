<template>
  <main id="app-store">
    <app-loading-spinner v-if="areAppsLoading" />
    <template v-else>
      <router-view />
    </template>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useAppsStore } from './piniaStores'
import { AppLoadingSpinner } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'LayoutContainer',
  components: { AppLoadingSpinner },
  setup() {
    const appsStore = useAppsStore()

    const areAppsLoading = ref(true)
    const appsLoadingPromise = appsStore.loadApps()
    onMounted(async () => {
      try {
        await appsLoadingPromise
      } catch (e) {
        console.error(e)
      } finally {
        areAppsLoading.value = false
      }
    })

    return {
      areAppsLoading
    }
  }
})
</script>

<style lang="scss">
#app-store {
  overflow: auto;
  padding: var(--oc-space-medium) !important;
}
</style>
