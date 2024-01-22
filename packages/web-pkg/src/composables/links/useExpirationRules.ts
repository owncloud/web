import { computed } from 'vue'
import { getExpirationRules } from '../../helpers'
import { useGettext } from 'vue3-gettext'
import { useCapabilityStore } from '../piniaStores'

export const useExpirationRules = () => {
  const capabilityStore = useCapabilityStore()
  const { current: currentLanguage } = useGettext()

  const expirationRules = computed(() => getExpirationRules({ capabilityStore, currentLanguage }))

  return { expirationRules }
}
