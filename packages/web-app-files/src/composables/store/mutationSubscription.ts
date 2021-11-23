import { onMounted, onBeforeUnmount } from '@vue/composition-api'
import { MutationPayload } from 'vuex'
import { useStore } from './store'

export const useMutationSubscription = <T extends MutationPayload>(
  mutations: string[],
  callback: (payload: T) => void
): void => {
  let unsubscribe
  onMounted(() => {
    unsubscribe = useStore().subscribe<T>(
      (mutation) => mutations.includes(mutation.type) && callback(mutation)
    )
  })

  onBeforeUnmount(() => unsubscribe())
}
