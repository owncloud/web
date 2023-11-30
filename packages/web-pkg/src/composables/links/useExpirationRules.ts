import { computed } from 'vue'
import { getExpirationRules } from '../../helpers'
import { useStore } from '../store'
import { useGettext } from 'vue3-gettext'

export const useExpirationRules = () => {
  const store = useStore()
  const { current: currentLanguage } = useGettext()

  const expirationRules = computed(() => getExpirationRules({ store, currentLanguage }))

  return { expirationRules }
}
