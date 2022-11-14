import { Store } from 'vuex'
import { computed } from 'vue'

interface PublicLinkPasswordOptions {
  store: Store<any>
}

export const usePublicLinkPassword = ({ store }: PublicLinkPasswordOptions) => {
  return computed(() => {
    return store.getters['runtime/auth/publicLinkPassword']
  })
}
