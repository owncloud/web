import { OAuth2Configuration, OIDCConfiguration, RuntimeConfiguration } from './types'
import isNil from 'lodash-es/isNil'
import urlJoin from 'proper-url-join'

export interface RawConfig {
  server: string
  auth?: any
  openIdConnect?: any
}

export class ConfigurationManager {
  private runtimeConfiguration: RuntimeConfiguration
  private oAuth2Configuration: OAuth2Configuration
  private oidcConfiguration: OIDCConfiguration

  constructor() {
    this.runtimeConfiguration = { serverUrl: '' }
  }

  public initialize(rawConfig: RawConfig): void {
    this.serverUrl = rawConfig.server
    this.oAuth2Configuration = rawConfig.auth ? (rawConfig.auth as OAuth2Configuration) : null
    this.oidcConfiguration = rawConfig.openIdConnect
      ? (rawConfig.openIdConnect as OIDCConfiguration)
      : null
  }

  set serverUrl(url: string) {
    // actually the trailing slash should not be needed if urlJoin is used everywhere to build urls
    this.runtimeConfiguration.serverUrl = urlJoin(url || window.location.origin, {
      trailingSlash: true
    })
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
