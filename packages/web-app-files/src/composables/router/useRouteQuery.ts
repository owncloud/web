import { customRef, Ref } from '@vue/composition-api'
import { useRouter } from './useRouter'

type QueryValue = string | (string | null)[]

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
        await router.replace({
          query: { [name]: v }
        })
        trigger()
      }
    }
  })
}
