import { computed } from 'vue'
import { useClientService } from '../'

export const useGraphClient = () => {
  const clientService = useClientService()

  const graphClient = computed(() => {
    return clientService.graphAuthenticated
  })

  return {
    graphClient
  }
}
