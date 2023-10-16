import { computed } from 'vue'
import { useStore } from '../store'

export const useEmbedMode = () => {
  const store = useStore()

  const isEnabled = computed<boolean>(() => store.getters.configuration.options.mode === 'embed')

  return { isEnabled }
}
