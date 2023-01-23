import { ClientService } from 'web-pkg/src/services'
import { ConfigurationManager } from 'web-pkg/src/configuration'
import { Store } from 'vuex'
import isEmpty from 'lodash-es/isEmpty'
import omit from 'lodash-es/omit'

export interface PublicLinkManagerOptions {
  clientService: ClientService
  configurationManager: ConfigurationManager
  store: Store<any>
}

export class PublicLinkManager {
  private clientService: ClientService
  private configurationManager: ConfigurationManager
  private store: Store<any>

  constructor(options: PublicLinkManagerOptions) {
    this.clientService = options.clientService
    this.configurationManager = options.configurationManager
    this.store = options.store
  }

  private static buildStorageKey(token: string, suffix: string): string {
    return `oc.publicLink.${token}.${suffix}`
  }

  async clear(token: string): Promise<void> {
    ;['resolved', 'passwordRequired', 'password'].forEach((key) => {
      sessionStorage.removeItem(PublicLinkManager.buildStorageKey(token, key))
    })
    await this.store.dispatch('runtime/auth/clearPublicLinkContext')
  }

  isResolved(token: string): boolean {
    const resolved = sessionStorage.getItem(PublicLinkManager.buildStorageKey(token, 'resolved'))
    return resolved === 'true'
  }

  setResolved(token: string, resolved: boolean): void {
    sessionStorage.setItem(PublicLinkManager.buildStorageKey(token, 'resolved'), resolved + '')
  }

  isPasswordRequired(token: string): boolean {
    const passwordRequired = sessionStorage.getItem(
      PublicLinkManager.buildStorageKey(token, 'passwordRequired')
    )
    return passwordRequired === 'true'
  }

  setPasswordRequired(token: string, required: boolean): void {
    sessionStorage.setItem(
      PublicLinkManager.buildStorageKey(token, 'passwordRequired'),
      required + ''
    )
  }

  getPassword(token: string): string {
    const password = sessionStorage.getItem(PublicLinkManager.buildStorageKey(token, 'password'))
    if (password) {
      try {
        return Buffer.from(password, 'base64').toString()
      } catch (e) {
        this.clear(token)
      }
    }
    return ''
  }

  setPassword(token: string, password: string): void {
    if (password.length) {
      const encodedPassword = Buffer.from(password).toString('base64')
      sessionStorage.setItem(PublicLinkManager.buildStorageKey(token, 'password'), encodedPassword)
    } else {
      sessionStorage.removeItem(PublicLinkManager.buildStorageKey(token, 'password'))
    }
  }

  async updateContext(token: string) {
    if (!this.isResolved(token)) {
      return
    }
    if (
      this.store.getters['runtime/auth/isPublicLinkContextReady'] &&
      this.store.getters['runtime/auth/publicLinkToken'] === token
    ) {
      return
    }

    let password
    if (this.isPasswordRequired(token)) {
      password = this.getPassword(token)
    }

    try {
      await this.fetchCapabilities({
        token,
        password
      })
    } catch (e) {
      console.error(e)
    }

    this.store.commit('runtime/auth/SET_PUBLIC_LINK_CONTEXT', {
      publicLinkToken: token,
      publicLinkPassword: password,
      publicLinkContextReady: true
    })
  }

  private async fetchCapabilities({ token = '', password = '' }): Promise<void> {
    if (!isEmpty(this.store.getters.capabilities)) {
      return
    }
    const client = this.clientService.ocsPublicLinkContext(
      this.configurationManager.serverUrl,
      token,
      password
    )
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
