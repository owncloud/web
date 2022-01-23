import { useRouter } from './useRouter'
import { ref, Ref } from '@vue/composition-api'

export const useRouteName = (): Ref<string> => {
  const router = useRouter()
  return ref(router.currentRoute?.name)
}
