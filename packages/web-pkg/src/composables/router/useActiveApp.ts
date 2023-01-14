import { computed, ComputedRef, unref } from 'vue'
import { useRoute } from './useRoute'
import { RouteLocationNormalizedLoaded } from 'vue-router'

export const activeApp = (route: RouteLocationNormalizedLoaded): string => {
  return route.path.split('/')[1]
}

export const useActiveApp = (): ComputedRef<string> => {
  const route = useRoute()
  return computed(() => {
    return activeApp(unref(route))
  })
}
