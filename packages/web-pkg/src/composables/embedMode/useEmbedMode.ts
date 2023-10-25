import { computed } from 'vue'
import { useStore } from '../store'

export const useEmbedMode = () => {
  const store = useStore()

  const isEnabled = computed<boolean>(() => store.getters.configuration.options.mode === 'embed')

  const isLocationPicker = computed<boolean>(() => {
    return store.getters.configuration.options.embedTarget === 'location'
  })

  return { isEnabled, isLocationPicker }
}
