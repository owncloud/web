import { computed, ComputedRef, unref } from '@vue/composition-api'
import { useRoute } from './useRoute'
import { Route } from 'vue-router'

export const activeApp = (route: Route): string => {
  return route.path.split('/')[1]
}

export const useActiveApp = (): ComputedRef<string> => {
  const route = useRoute()
  return computed(() => {
    return activeApp(unref(route))
  })
}
