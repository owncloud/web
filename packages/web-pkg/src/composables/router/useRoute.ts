import { Ref } from 'vue'
import { useRouter } from './useRouter'
import { RouteLocationNormalizedLoaded } from 'vue-router'

export const useRoute = (): Ref<RouteLocationNormalizedLoaded> => {
  const router = useRouter()
  return useRouter().currentRoute
}
