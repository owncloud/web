import { ClientService } from 'web-pkg/src/services'
import { ConfigurationManager } from 'web-pkg/src/configuration'
import { Store } from 'vuex'
import isEmpty from 'lodash-es/isEmpty'

export interface OcmLinkManagerOptions {
  clientService: ClientService
  configurationManager: ConfigurationManager
  store: Store<any>
}

export class OcmLinkManager {
  private clientService: ClientService
  private configurationManager: ConfigurationManager
  private store: Store<any>

  constructor(options: OcmLinkManagerOptions) {
    this.clientService = options.clientService
    this.configurationManager = options.configurationManager
    this.store = options.store
  }

  private static buildStorageKey(token: string, suffix: string): string {
    return `oc.ocmLink.${token}.${suffix}`
  }

  // async clear(token: string): Promise<void> {
  //   ;['resolved', 'passwordRequired', 'password'].forEach((key) => {
  //     sessionStorage.removeItem(PublicLinkManager.buildStorageKey(token, key))
  //   })
  //   await this.store.dispatch('runtime/auth/clearPublicLinkContext')
  // }

  async updateContext(token: string) {
    try {
      await this.fetchCapabilities({
        token
      })
    } catch (e) {
      console.error(e)
    }

    // this.store.commit('runtime/auth/SET_PUBLIC_LINK_CONTEXT', {
    //   publicLinkToken: token,
    //   publicLinkPassword: password,
    //   publicLinkContextReady: true
    // })
  }

  private async fetchCapabilities({ token = '' }): Promise<void> {
    if (!isEmpty(this.store.getters.capabilities)) {
      return
    }
    const client = this.clientService.ocmLinkContext(this.configurationManager.serverUrl, token)
    const response = await client.getCapabilities()

    // FIXME: ocis at the moment is not able to create archives for public links that are password protected
    // until this is supported by the backend remove it hard as a workaround
    // https://github.com/owncloud/web/issues/6423
    // if (password) {
    //   this.store.commit('SET_CAPABILITIES', {
    //     capabilities: omit(response.capabilities, ['files.archivers']),
    //     version: response.version
    //   })
    //   return
    // }

    this.store.commit('SET_CAPABILITIES', response)
  }
}
