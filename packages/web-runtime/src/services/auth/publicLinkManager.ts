import { ClientService } from '@ownclouders/web-pkg'
import { ConfigurationManager } from '@ownclouders/web-pkg'
import { Store } from 'vuex'
import isEmpty from 'lodash-es/isEmpty'
import { PublicLinkType } from '@ownclouders/web-client/src/helpers'

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

  setType(token: string, type: PublicLinkType): void {
    sessionStorage.setItem(PublicLinkManager.buildStorageKey(token, 'type'), type)
  }

  getType(token: string): PublicLinkType {
    return sessionStorage.getItem(PublicLinkManager.buildStorageKey(token, 'type')) as any
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
      publicLinkContextReady: true,
      publicLinkType: this.getType(token)
    })
  }

  clearContext() {
    this.store.commit('runtime/auth/SET_PUBLIC_LINK_CONTEXT', {
      publicLinkContextReady: false
    })
  }

  private async fetchCapabilities({ token = '', password = '' }): Promise<void> {
    if (!isEmpty(this.store.getters.capabilities)) {
      return
    }
    const client = this.clientService.ocsPublicLinkContext(password)
    const response = await client.getCapabilities()
    this.store.commit('SET_CAPABILITIES', response)
  }
}
