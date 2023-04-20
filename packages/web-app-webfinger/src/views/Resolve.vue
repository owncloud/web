<template>
  <div class="webfinger-resolve oc-height-viewport oc-flex oc-flex-center oc-flex-middle">
    <div
      class="oc-card oc-card-body oc-width-large oc-height-small oc-flex oc-flex-center oc-flex-middle oc-text-center"
    >
      <p v-if="isLoading" v-text="resolveMessage" />
      <p v-else-if="errorMessage" v-text="errorMessage" />
      <p v-else v-text="successMessage" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useClientService, useConfigurationManager, useLoadingService } from 'web-pkg'
import { OwnCloudInstance, WebfingerDiscovery } from 'web-app-webfinger/src/discovery'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'WebfingerResolve',
  setup() {
    const configurationManager = useConfigurationManager()
    const clientService = useClientService()
    const loadingService = useLoadingService()
    const { $gettext } = useGettext()

    const ownCloudInstances = ref<OwnCloudInstance[]>([])
    const isLoading = computed(() => loadingService.isLoading)
    const errorMessage = ref('')
    const webfingerDiscovery = new WebfingerDiscovery(configurationManager.serverUrl, clientService)
    loadingService.addTask(async () => {
      try {
        const instances = await webfingerDiscovery.discoverOwnCloudInstances()
        ownCloudInstances.value = instances
        if (instances.length === 0) {
          // TODO: find good error message for a user not having any ownCloud instances
          errorMessage.value = $gettext('We were unable to resolve your destination.')
        }
      } catch (e) {
        console.error(e)
        // TODO: find good error message for unexpected errors while discovering ownCloud instances
        errorMessage.value = $gettext('We were unable to resolve your destination.')
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
      errorMessage,
      // TODO: find good resolve message
      resolveMessage: $gettext("Please wait while we're resolving your destination…"),
      // TODO: find good success message
      successMessage: $gettext(
        "We resolved your destination. Please wait while you're being redirected…"
      )
    }
  }
})
</script>

<style lang="scss">
.webfinger-resolve {
  .oc-card {
    background: var(--oc-color-background-highlight);
    border-radius: 15px;
  }

  p {
    margin: 0;
    font-size: var(--oc-font-size-large);
  }
}
</style>

