import { computed, Ref, unref } from 'vue'
import { useRouter } from './useRouter'
import { QueryValue } from './types'
import { Router } from 'vue-router'

let lastNavigation = Promise.resolve()

export const useRouteQuery = (
  name: string,
  defaultValue?: QueryValue,
  router?: Router
): Ref<QueryValue> => {
  router = router || useRouter()

  return computed({
    get() {
      return unref(router.currentRoute).query[name] || defaultValue
    },
    set(v) {
      if (unref(router.currentRoute).query[name] === v) {
        return
      }

      const navigation = lastNavigation.then(async () => {
        try {
          await router.replace({
            // FIXME: passing the path does not seem to be required at runtime, but somehow is required in tests
            path: unref(router.currentRoute).path,
            query: {
              ...unref(router.currentRoute).query,
              [name]: v
            }
          })
        } catch (e) {}
      })
      lastNavigation = navigation
    }
  })
}
