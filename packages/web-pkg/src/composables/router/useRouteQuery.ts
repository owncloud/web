import { computed, Ref, unref } from 'vue'
import { useRouter } from './useRouter'
import { QueryValue } from './types'

export const useRouteQuery = (name: string, defaultValue?: QueryValue): Ref<QueryValue> => {
  const router = useRouter()

  return computed({
    get() {
      return unref(router.currentRoute).query[name] || defaultValue
    },
    async set(v) {
      if (unref(router.currentRoute).query[name] === v) {
        return
      }
      await router.replace({
        query: {
          ...unref(router.currentRoute).query,
          [name]: v
        }
      })
    }
  })
}
