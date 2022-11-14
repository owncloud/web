import { Store } from 'vuex'
import { computed } from 'vue'

interface AccessTokenOptions {
  store: Store<any>
}

export const useAccessToken = ({ store }: AccessTokenOptions) => {
  return computed(() => {
    return store.getters['runtime/auth/accessToken'] as string
  })
}
