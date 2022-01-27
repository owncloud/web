import { useRouter } from './useRouter'
import { computed, ComputedRef } from '@vue/composition-api'

export const useRouteName = (): ComputedRef<string> => {
  const router = useRouter()
  return computed(() => router.currentRoute?.name)
}
