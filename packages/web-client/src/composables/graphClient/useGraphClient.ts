import { computed, unref } from '@vue/composition-api'
import { Store } from 'vuex'
import { useAccessToken, useClientService, useStore } from 'web-pkg/src/composables'

interface GraphClientOptions {
  store?: Store<any>
}

export const useGraphClient = ({ store }: GraphClientOptions = {}) => {
  store = store || useStore<any>()
  const accessToken = useAccessToken({ store })
  const clientService = useClientService()

  const graphClient = computed(() => {
    return clientService.graphAuthenticated(store.getters.configuration.server, unref(accessToken))
  })

  return {
    graphClient
  }
}
