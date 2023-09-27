import { ref, Ref, watch } from 'vue'
import { useRoute, useRouter } from '@ownclouders/web-pkg/src/composables'
import { ActiveRouteDirectorFunc } from '../../router'

/**
 * watches the current route and re-evaluates the provided active location director
 * on each route name update.
 *
 * @param director
 * @param comparatives
 */
export const useActiveLocation = <T extends string>(
  director: ActiveRouteDirectorFunc<T>,
  ...comparatives: T[]
): Ref<boolean> => {
  const value = ref(false)
  const router = useRouter()
  const currentRoute = useRoute()
  watch(
    currentRoute,
    () => {
      value.value = director(router, ...comparatives)
    },
    { immediate: true }
  )
  return value
}
