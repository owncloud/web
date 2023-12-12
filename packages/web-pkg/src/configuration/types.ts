export interface CustomTranslation {
  url: string
}

export interface RuntimeConfiguration {
  serverUrl: string
  customTranslations?: Array<CustomTranslation>
}

export interface RoutingOptionsConfiguration {
  fullShareOwnerPaths?: boolean
  idBased?: boolean
}

export interface UploadOptionsConfiguration {
  companionUrl?: string
}

export interface OptionsConfiguration {
  routing?: RoutingOptionsConfiguration
  upload?: UploadOptionsConfiguration
  logoutUrl?: string
  loginUrl?: string
  contextHelpersReadMore?: boolean
  contextHelpers?: boolean
  openAppsInTab?: boolean
  openLinksWithDefaultApp?: boolean
  tokenStorageLocal?: boolean
  displayThumbnails?: boolean
  disabledExtensions?: string[]
  isRunningOnEos?: boolean
  userListRequiresFilter?: boolean
  editor?: {
    openAsPreview?: boolean | string[]
  }
  ocm?: {
    openRemotely?: boolean
  }
  embed?: {
    enabled?: boolean
    target?: string
    messagesOrigin?: string | null
    delegateAuthentication?: boolean
    delegateAuthenticationOrigin?: string | null
  }
}

export interface OAuth2Configuration {
  clientId: string
  clientSecret?: string
  url: string
  authUrl: string
  logoutUrl?: string
}

export interface OIDCConfiguration {
  // eslint-disable-next-line camelcase
  metadata_url: string
  authority: string
  // eslint-disable-next-line camelcase
  client_id: string
  // eslint-disable-next-line camelcase
  response_type: string
  scope: string
}
