import { computed } from '@vue/composition-api'
import { Store } from 'vuex'

interface PublicLinkContextOptions {
  store: Store<any>
}

export const usePublicLinkContext = ({ store }: PublicLinkContextOptions) => {
  return computed(() => {
    return store.getters['runtime/auth/isPublicLinkContextReady']
  })
}
