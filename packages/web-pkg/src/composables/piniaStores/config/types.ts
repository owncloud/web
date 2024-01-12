import { init } from '@sentry/vue'
import { AppConfigObject } from '../../../apps'

export interface CustomTranslation {
  url: string
}

export interface OAuth2Config {
  apiUrl?: string
  authUrl?: string
  clientId?: string
  clientSecret?: string
  logoutUrl?: string
  metaDataUrl?: string
  url?: string
}

export interface OpenIdConnectConfig {
  authority?: string
  client_id?: string
  client_secret?: string
  dynamic?: string
  metadata_url?: string
  response_type?: string
  scope?: string
}

export type SentryConfig = Parameters<typeof init>[0]

export interface StyleConfig {
  href?: string
}

export interface ScriptConfig {
  async?: boolean
  src?: string
}

export interface OptionsConfig {
  cernFeatures?: boolean
  concurrentRequests?: {
    resourceBatchActions?: number
    sse?: number
    shares?: {
      create?: number
      list?: number
    }
  }
  contextHelpers?: boolean
  contextHelpersReadMore?: boolean
  defaultExtension?: string
  disabledExtensions?: string[]
  disableFeedbackLink?: boolean
  disablePreviews?: boolean
  displayResourcesLazy?: boolean
  displayThumbnails?: boolean
  accountEditLink?: {
    href?: string
  }
  editor?: {
    autosaveEnabled?: boolean
    autosaveInterval?: number
    openAsPreview?: boolean | string[]
  }
  embed?: {
    enabled?: boolean
    target?: string
    messagesOrigin?: string
    delegateAuthentication?: boolean
    delegateAuthenticationOrigin?: string
  }
  feedbackLink?: {
    ariaLabel?: string
    description?: string
    href?: string
  }
  hoverableQuickActions?: boolean
  isRunningOnEos?: boolean
  loginUrl?: string
  logoutUrl?: string
  ocm?: {
    openRemotely?: boolean
  }
  openAppsInTab?: boolean
  openLinksWithDefaultApp?: boolean
  previewFileMimeTypes?: string[]
  routing?: {
    fullShareOwnerPaths?: boolean
    idBased?: boolean
  }
  runningOnEos?: boolean
  sharingRecipientsPerPage?: number
  sidebar?: {
    shares?: {
      showAllOnLoad?: boolean
    }
  }
  tokenStorageLocal?: boolean
  topCenterNotifications?: boolean
  upload?: {
    companionUrl?: string
    xhr?: {
      timeout?: number
    }
  }
  userListRequiresFilter?: boolean
}

// raw config that is coming from the server
export interface RawConfig {
  server: string
  theme: string
  options: OptionsConfig
  apps?: string[]
  external_apps?: AppConfigObject[]
  customTranslations?: CustomTranslation[]
  auth?: OAuth2Config
  openIdConnect?: OpenIdConnectConfig
  sentry?: SentryConfig
  scripts?: ScriptConfig[]
  styles?: StyleConfig[]
}
