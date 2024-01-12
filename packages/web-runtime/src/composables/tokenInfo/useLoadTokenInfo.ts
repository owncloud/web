import { useTask } from 'vue-concurrency'
import { useClientService, useAuthStore, AuthStore } from '@ownclouders/web-pkg'
import { ClientService } from '@ownclouders/web-pkg'

export interface LoadTokenInfoOptions {
  clientService?: ClientService
  authStore?: AuthStore
}

export function useLoadTokenInfo(options: LoadTokenInfoOptions) {
  const { owncloudSdk } = options.clientService || useClientService()
  const authStore = options.authStore || useAuthStore()

  const loadTokenInfoTask = useTask(function* (signal, token: string) {
    let tokenInfo
    try {
      if (authStore.userContextReady) {
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
