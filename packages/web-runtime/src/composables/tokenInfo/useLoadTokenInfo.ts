import { unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { useClientService, useStore, useUserContext } from 'web-pkg/src/composables'

export function useLoadTokenInfo(token) {
  const { owncloudSdk } = useClientService()
  const store = useStore()
  const isUserContext = useUserContext({ store })

  const loadTokenInfoTask = useTask(function* () {
    let tokenInfo

    try {
      if (unref(isUserContext)) {
        tokenInfo = yield owncloudSdk.shares.getProtectedTokenInfo(token)
      } else {
        tokenInfo = yield owncloudSdk.shares.getUnprotectedTokenInfo(token)
      }
    } catch (e) {
      // backend doesn't support the token info endpoint
      return {}
    }
    return {
      ...tokenInfo,
      alias_link: tokenInfo.alias_link === 'true',
      password_protected: tokenInfo.password_protected === 'true'
    }
  })

  return { loadTokenInfoTask }
}
