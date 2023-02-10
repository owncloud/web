import { computed, nextTick, Ref, unref } from 'vue'
import { useRouter } from './useRouter'
import { QueryValue } from './types'

let queue: Record<string, any> = {}

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

      queue[name] = v === null ? undefined : v

      await nextTick()
      await router.replace({
        query: {
          ...unref(router.currentRoute).query,
          ...queue
        }
      })

      queue = {}
    }
  })
}
