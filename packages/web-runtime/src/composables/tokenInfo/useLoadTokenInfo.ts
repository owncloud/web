import { useTask } from 'vue-concurrency'
import convert from 'xml-js'
import { useClientService, useAuthStore, AuthStore } from '@ownclouders/web-pkg'
import { ClientService } from '@ownclouders/web-pkg'
import { urlJoin } from '@ownclouders/web-client/src/utils'

export interface LoadTokenInfoOptions {
  clientService?: ClientService
  authStore?: AuthStore
}

export function useLoadTokenInfo(options: LoadTokenInfoOptions) {
  const clientService = options.clientService || useClientService()
  const authStore = options.authStore || useAuthStore()

  const loadTokenInfoTask = useTask(function* (signal, token: string) {
    try {
      const url = authStore.userContextReady
        ? 'ocs/v1.php/apps/files_sharing/api/v1/tokeninfo/protected'
        : 'ocs/v1.php/apps/files_sharing/api/v1/tokeninfo/unprotected'

      // FIXME: use graph endpoint as soon as it's available: https://github.com/owncloud/ocis/issues/8617
      const { data } = authStore.userContextReady
        ? yield clientService.httpAuthenticated.get(urlJoin(url, token))
        : yield clientService.httpUnAuthenticated.get(urlJoin(url, token))

      const parsedData = convert.xml2js(data, { compact: true, nativeType: false }) as any
      const tokenInfo = parsedData.ocs.data

      return {
        id: tokenInfo.id._text,
        link_url: tokenInfo.link_url._text,
        alias_link: tokenInfo.alias_link._text === 'true',
        password_protected: tokenInfo.password_protected._text === 'true',
        token
      }
    } catch (e) {
      // backend doesn't support the token info endpoint
      return {}
    }
  })

  return { loadTokenInfoTask }
}
