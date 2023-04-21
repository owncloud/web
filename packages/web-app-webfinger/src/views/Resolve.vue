<template>
  <div
    class="webfinger-resolve oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle"
  >
    <div class="oc-card oc-card-body oc-text-center oc-width-large">
      <template v-if="hasError">
        <h2 key="webfinger-resolve-error">
          <span v-text="$gettext('Sorry!')" />
        </h2>
        <p v-text="$gettext('Something went wrong.')" />
        <p v-text="$gettext('(We could not resolve the destination)')" />
      </template>
      <template v-else>
        <h2 key="webfinger-resolve-loading">
          <span v-text="$gettext('One moment please…')" />
        </h2>
        <p v-text="$gettext('You are being redirected.')" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useClientService, useConfigurationManager, useLoadingService } from 'web-pkg'
import { OwnCloudInstance, WebfingerDiscovery } from 'web-app-webfinger/src/discovery'

export default defineComponent({
  name: 'WebfingerResolve',
  setup() {
    const configurationManager = useConfigurationManager()
    const clientService = useClientService()
    const loadingService = useLoadingService()

    const ownCloudInstances = ref<OwnCloudInstance[]>([])
    const isLoading = computed(() => loadingService.isLoading)
    const hasError = ref(false)
    const webfingerDiscovery = new WebfingerDiscovery(configurationManager.serverUrl, clientService)
    loadingService.addTask(async () => {
      try {
        const instances = await webfingerDiscovery.discoverOwnCloudInstances()
        ownCloudInstances.value = instances
        if (instances.length === 0) {
          hasError.value = true
        }
      } catch (e) {
        console.error(e)
        hasError.value = true
      }
    })

    watch(ownCloudInstances, (instances) => {
      if (instances.length === 0) {
        return
      }
      // we can't deal with multi-instance results. just pick the first one for now.
      window.location.href = ownCloudInstances.value[0].href
    })

    return {
      ownCloudInstances,
      isLoading,
      hasError
    }
  }
})
</script>

<style lang="scss">
.webfinger-resolve {
  .oc-card {
    background: var(--oc-color-background-highlight);
    border-radius: 15px;

    &-body {
      h2 {
        margin-top: 0;
      }
      p {
        font-size: var(--oc-font-size-large);
      }
    }
  }
}
</style>

