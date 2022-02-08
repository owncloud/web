import { customRef, Ref } from '@vue/composition-api'
import { useRouter } from './useRouter'
import { QueryValue } from './types'

export const useRouteQuery = (name: string, defaultValue?: QueryValue): Ref<QueryValue> => {
  const router = useRouter()

  return customRef<QueryValue>((track, trigger) => {
    router.afterEach((to, from) => to.query[name] !== from.query[name] && trigger())

    return {
      get() {
        track()
        return router.currentRoute.query[name] || defaultValue
      },
      async set(v) {
        if (router.currentRoute.query[name] === v) {
          return
        }
        await router.replace({
          query: {
            ...router.currentRoute.query,
            [name]: v
          }
        })
        trigger()
      }
    }
  })
}
