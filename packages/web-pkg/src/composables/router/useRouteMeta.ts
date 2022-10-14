import { computed, Ref, unref } from '@vue/composition-api'
import { useRoute } from './useRoute'

export const useRouteMeta = (key: string, defaultValue?: string): Ref<string> => {
  const route = useRoute()
  return computed(() => unref(route).meta[key] || defaultValue)
}
