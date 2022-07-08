import { Store } from 'vuex'
import { computed } from '@vue/composition-api'

interface PublicLinkPasswordOptions {
  store: Store<any>
}

export const usePublicLinkPassword = ({ store }: PublicLinkPasswordOptions) => {
  return computed(() => {
    return store.getters['runtime/auth/publicLinkPassword']
  })
}
