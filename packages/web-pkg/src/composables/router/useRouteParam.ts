import { customRef, Ref } from '@vue/composition-api'
import { useRouter } from './useRouter'
import { ParamValue } from './types'

export const useRouteParam = (name: string, defaultValue?: ParamValue): Ref<ParamValue> => {
  const router = useRouter()

  return customRef<ParamValue>((track, trigger) => {
    router.afterEach((to, from) => to.params[name] !== from.params[name] && trigger())

    return {
      get() {
        track()
        return router.currentRoute.params[name] || defaultValue
      },
      async set(v) {
        if (router.currentRoute.params[name] === v) {
          return
        }
        await router.replace({
          params: {
            ...router.currentRoute.params,
            [name]: v
          }
        })
        trigger()
      }
    }
  })
}
