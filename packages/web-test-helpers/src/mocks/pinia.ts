import { createTestingPinia } from '@pinia/testing'
import defaultTheme from '../../../web-runtime/themes/owncloud/theme.json'
import { User } from '../../../web-client/src/generated'
import { Message, Modal, WebThemeType } from '../../../web-pkg/src/composables/piniaStores'
import { Capabilities } from '../../../web-client/src/ocs'
import { mock } from 'vitest-mock-extended'
import { SpaceResource } from '../../../web-client/src'
import { OptionsConfig } from '../../../web-pkg/src/composables/piniaStores/config/types'
import { Resource, Share } from '../../../web-client/src/helpers'
import {
  AncestorMetaData,
  ApplicationFileExtension,
  ClipboardActions
} from '../../../web-pkg/types'

export { createTestingPinia }

export type PiniaMockOptions = {
  stubActions?: boolean
  appsState?: { fileExtensions?: ApplicationFileExtension[] }
  authState?: {
    accessToken?: string
    idpContextReady?: boolean
    userContextReady?: boolean
    publicLinkContextReady?: boolean
  }
  themeState?: { availableThemes?: WebThemeType[]; currentTheme?: WebThemeType }
  clipboardState?: { action?: ClipboardActions; resources?: Resource[] }
  configState?: {
    server?: string
    options?: OptionsConfig
  }
  messagesState?: { messages?: Message[] }
  modalsState?: { modals?: Modal[] }
  resourcesStore?: {
    resources?: Resource[]
    currentFolder?: Resource
    ancestorMetaData?: AncestorMetaData
    selectedIds?: string[]
    areFileExtensionsShown?: boolean
  }
  sharesState?: { shares?: Share[]; loading?: boolean }
  spacesState?: { spaces?: SpaceResource[]; spaceMembers?: Share[] }
  userState?: { user?: User }
  capabilityState?: {
    capabilities?: Partial<Capabilities['capabilities']>
    isInitialized?: boolean
  }
}

export function createMockStore({
  stubActions = true,
  appsState = {},
  authState = {},
  clipboardState = {},
  configState = {},
  themeState = {},
  messagesState = {},
  modalsState = {},
  resourcesStore = {},
  sharesState = {},
  spacesState = {},
  userState = {},
  capabilityState = {}
}: PiniaMockOptions = {}) {
  const defaultOwnCloudTheme = {
    defaults: {
      ...defaultTheme.clients.web.defaults,
      common: {
        ...defaultTheme.common,
        urls: ['https://imprint.url.theme', 'https://privacy.url.theme']
      }
    },
    themes: defaultTheme.clients.web.themes
  }

  return createTestingPinia({
    stubActions,
    initialState: {
      apps: { ...appsState },
      auth: { ...authState },
      clipboard: { resources: [], ...clipboardState },
      config: {
        apps: [],
        external_apps: [],
        customTranslations: [],
        oAuth2: {},
        openIdConnect: {},
        options: {},
        server: '',
        ...configState
      },
      messages: { messages: [], ...messagesState },
      modals: {
        modals: [],
        ...modalsState
      },
      theme: {
        currentTheme: {
          ...defaultOwnCloudTheme.defaults,
          ...defaultOwnCloudTheme.themes[0]
        },
        availableThemes: defaultOwnCloudTheme.themes,
        ...themeState
      },
      resources: { resources: [], ...resourcesStore },
      shares: { shares: [], ...sharesState },
      spaces: { spaces: [], spaceMembers: [], ...spacesState },
      user: { user: { ...mock<User>({ id: '1' }), ...(userState?.user && { ...userState.user }) } },
      capabilities: {
        isInitialized: capabilityState?.isInitialized ? capabilityState.isInitialized : true,
        capabilities: {
          ...mock<Capabilities['capabilities']>(),
          ...(capabilityState?.capabilities && { ...capabilityState.capabilities })
        }
      }
    }
  })
}
