import { computed } from '@vue/composition-api'
import { Store } from 'vuex'

interface PublicLinkTokenOptions {
  store: Store<any>
}

export const usePublicLinkToken = ({ store }: PublicLinkTokenOptions) => {
  return computed(() => {
    return store.getters['runtime/auth/publicLinkToken']
  })
}
