import {
  CustomTranslation,
  OAuth2Configuration,
  OIDCConfiguration,
  OptionsConfiguration,
  RuntimeConfiguration
} from './types'
import isNil from 'lodash-es/isNil'
import get from 'lodash-es/get'
import set from 'lodash-es/set'
import { urlJoin } from '@ownclouders/web-client/src/utils'

export interface RawConfig {
  server: string
  auth?: any
  openIdConnect?: any
  options?: OptionsConfiguration
  customTranslations?: Array<CustomTranslation>
}

export class ConfigurationManager {
  private readonly runtimeConfiguration: RuntimeConfiguration
  private readonly optionsConfiguration: OptionsConfiguration
  private oAuth2Configuration: OAuth2Configuration
  private oidcConfiguration: OIDCConfiguration

  constructor() {
    this.runtimeConfiguration = { serverUrl: '' }
    this.optionsConfiguration = {}
  }

  public initialize(rawConfig: RawConfig): void {
    this.serverUrl = rawConfig.server
    this.options = rawConfig.options
    this.oAuth2Configuration = rawConfig.auth ? (rawConfig.auth as OAuth2Configuration) : null
    this.oidcConfiguration = rawConfig.openIdConnect
      ? (rawConfig.openIdConnect as OIDCConfiguration)
      : null
    this.logoutUrl = rawConfig.options?.logoutUrl
    this.customTranslations = rawConfig.customTranslations
  }

  set logoutUrl(url: string) {
    this.optionsConfiguration.logoutUrl = url
  }

  get logoutUrl(): string {
    return this.optionsConfiguration.logoutUrl
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

  set customTranslations(customTranslations: Array<CustomTranslation>) {
    this.runtimeConfiguration.customTranslations = customTranslations || []
  }
  get customTranslations(): Array<CustomTranslation> {
    return this.runtimeConfiguration.customTranslations
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

  set options(options: OptionsConfiguration) {
    set(this.optionsConfiguration, 'routing.idBased', get(options, 'routing.idBased', true))
    set(
      this.optionsConfiguration,
      'routing.fullShareOwnerPaths',
      get(options, 'routing.fullShareOwnerPaths', false)
    )
    set(
      this.optionsConfiguration,
      'contextHelpersReadMore',
      get(options, 'contextHelpersReadMore', true)
    )
    set(this.optionsConfiguration, 'contextHelpers', get(options, 'contextHelpers', true))
    set(this.optionsConfiguration, 'openAppsInTab', get(options, 'openAppsInTab', false))
    set(
      this.optionsConfiguration,
      'openLinksWithDefaultApp',
      get(options, 'openLinksWithDefaultApp', true)
    )
    set(this.optionsConfiguration, 'upload.companionUrl', get(options, 'upload.companionUrl', ''))
    set(this.optionsConfiguration, 'tokenStorageLocal', get(options, 'tokenStorageLocal', true))
    set(this.optionsConfiguration, 'loginUrl', get(options, 'loginUrl', ''))
    set(this.optionsConfiguration, 'disabledExtensions', get(options, 'disabledExtensions', []))
    set(this.optionsConfiguration, 'isRunningOnEos', get(options, 'isRunningOnEos', false))
  }

  get options(): OptionsConfiguration {
    return this.optionsConfiguration
  }
}

export const configurationManager = new ConfigurationManager()
