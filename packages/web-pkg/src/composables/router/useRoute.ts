import { ref, Ref, readonly } from '@vue/composition-api'
import { useRouter } from './useRouter'
import { Route } from 'vue-router'

export const useRoute = (): Ref<Route> => {
  const router = useRouter()
  const currentRoute = ref()
  currentRoute.value = router.currentRoute
  router.afterEach((to) => (currentRoute.value = { ...to }))

  return readonly(currentRoute)
}
