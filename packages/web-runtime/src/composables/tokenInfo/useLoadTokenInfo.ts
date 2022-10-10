import { unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { useClientService, useStore, useUserContext } from 'web-pkg/src/composables'

export function useLoadTokenInfo(token) {
  const { owncloudSdk } = useClientService()
  const store = useStore()
  const isUserContext = useUserContext({ store })

  const loadTokenInfoTask = useTask(function* () {
    try {
      if (unref(isUserContext)) {
        return yield owncloudSdk.shares.getProtectedTokenInfo(token)
      } else {
        return yield owncloudSdk.shares.getUnprotectedTokenInfo(token)
      }
    } catch (e) {} // backend doesn't support the token info endpoint
    return {}
  })

  return { loadTokenInfoTask }
}
