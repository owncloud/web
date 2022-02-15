import { computed, ComputedRef, unref } from '@vue/composition-api'
import { useRoute } from './useRoute'

export const useActiveApp = (): ComputedRef<string> => {
  const route = useRoute()
  return computed(() => {
    return unref(route).path.split('/')[1]
  })
}
