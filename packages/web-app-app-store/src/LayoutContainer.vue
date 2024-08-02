<template>
  <main id="app-store">
    <loading-apps v-if="areAppsLoading" />
    <template v-else>
      <router-view />
    </template>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useAppsStore } from './piniaStores'
import { useLoadingService } from '@ownclouders/web-pkg'
import LoadingApps from './components/LoadingApps.vue'

export default defineComponent({
  name: 'LayoutContainer',
  components: { LoadingApps },
  setup() {
    const appsStore = useAppsStore()
    const loadingService = useLoadingService()

    const areAppsLoading = ref(true)
    loadingService.addTask(async () => {
      try {
        await appsStore.loadApps()
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
