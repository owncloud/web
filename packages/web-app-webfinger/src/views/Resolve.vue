<template>
  <div></div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useClientService, useConfigurationManager, useLoadingService } from 'web-pkg'
import { WebfingerDiscovery } from 'web-app-webfinger/src/discovery'

interface OwnCloudInstance {
  rel: string
  href: string
  titles?: any
}

// TODO: error message if user doesn't have instances

export default defineComponent({
  name: 'WebfingerResolve',
  setup() {
    const ownCloudInstances = ref<OwnCloudInstance[]>([])
    const loadingService = useLoadingService()
    const isResolving = computed(() => loadingService.isLoading)
    const clientService = useClientService()
    const configurationManager = useConfigurationManager()
    const webfingerDiscovery = new WebfingerDiscovery(configurationManager.serverUrl, clientService)
    loadingService.addTask(async () => {
      const instances = await webfingerDiscovery.discoverOwnCloudInstances()
      console.log(instances)
      // TODO: omit oidc issuer from instances
      ownCloudInstances.value = instances
    })
    return {
      ownCloudInstances,
      isResolving
    }
  }
})
</script>
