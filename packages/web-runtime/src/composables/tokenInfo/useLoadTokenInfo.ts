import { Ref, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import { useClientService, useStore, useUserContext } from '@ownclouders/web-pkg'
import { ClientService } from '@ownclouders/web-pkg'

export interface LoadTokenInfoOptions {
  clientService?: ClientService
  isUserContext?: Ref<boolean>
}

export function useLoadTokenInfo(options: LoadTokenInfoOptions) {
  const { owncloudSdk } = options.clientService || useClientService()
  const isUserContext = options.isUserContext || useUserContext({ store: useStore() })

  const loadTokenInfoTask = useTask(function* (signal, token: string) {
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
