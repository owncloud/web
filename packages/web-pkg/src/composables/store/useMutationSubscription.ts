import { onMounted, onBeforeUnmount } from '@vue/composition-api'
import { MutationPayload, SubscribeOptions } from 'vuex'
import { useStore } from './useStore'

export const useMutationSubscription = <P extends MutationPayload>(
  mutations: string[],
  callback: (mutation: P) => void,
  options?: SubscribeOptions
): void => {
  let unsubscribe
  onMounted(() => {
    unsubscribe = useStore().subscribe<P>(
      (mutation: P) => mutations.includes(mutation.type) && callback(mutation),
      options
    )
  })

  onBeforeUnmount(() => unsubscribe())
}
