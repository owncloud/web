import { OAuth2Configuration, OIDCConfiguration, RuntimeConfiguration } from './types'
import isNil from 'lodash-es/isNil'

export interface RawConfig {
  server: string
  auth?: any
  openIdConnect?: any
}

export class ConfigurationManager {
  private runtimeConfiguration: RuntimeConfiguration
  private oAuth2Configuration: OAuth2Configuration
  private oidcConfiguration: OIDCConfiguration

  public initialize(rawConfig: RawConfig): void {
    this.runtimeConfiguration = { serverUrl: '' }
    this.serverUrl = rawConfig.server
    this.oAuth2Configuration = rawConfig.auth ? (rawConfig.auth as OAuth2Configuration) : null
    this.oidcConfiguration = rawConfig.openIdConnect
      ? (rawConfig.openIdConnect as OIDCConfiguration)
      : null
  }

  set serverUrl(url: string) {
    this.runtimeConfiguration.serverUrl = (url || window.location.origin).replace(/\/+$/, '') + '/'
  }

  get serverUrl(): string {
    return this.runtimeConfiguration.serverUrl
  }

  get isOAuth2(): boolean {
    return !isNil(this.oAuth2Configuration)
  }

  get oAuth2(): OAuth2Configuration {
    return this.oAuth2Configuration
  }

  get isOIDC(): boolean {
    return !isNil(this.oidcConfiguration)
  }

  get oidc(): OIDCConfiguration {
    return this.oidcConfiguration
  }
}

export const configurationManager = new ConfigurationManager()
