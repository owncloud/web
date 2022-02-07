import { useRouter } from './useRouter'
import { Ref, ref, watch } from '@vue/composition-api'

export const useRouteName = (): Ref<string> => {
  const router = useRouter()
  const routeName = ref('')
  watch(
    () => router.currentRoute,
    (currentRoute) => {
      routeName.value = currentRoute?.name
    },
    { immediate: true }
  )
  return routeName
}
