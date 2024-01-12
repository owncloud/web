import { createTestingPinia } from '@pinia/testing'
import defaultTheme from '../../../web-runtime/themes/owncloud/theme.json'
import { User } from '../../../web-client/src/generated'
import { Message, Modal, WebThemeType } from '../../../web-pkg/src/composables/piniaStores'
import { Capabilities } from '../../../web-client/src/ocs'
import { mock } from 'jest-mock-extended'
import { SpaceResource } from '../../../web-client/src'
import { Share } from '../../../web-client/src/helpers'

export { createTestingPinia }

export type PiniaMockOptions = {
  stubActions?: boolean
  authState?: {
    accessToken?: string
    idpContextReady?: boolean
    userContextReady?: boolean
    publicLinkContextReady?: boolean
  }
  themeState?: { availableThemes?: WebThemeType[]; currentTheme?: WebThemeType }
  messagesState?: { messages?: Message[] }
  modalsState?: { modals?: Modal[] }
  spacesState?: { spaces?: SpaceResource[]; spaceMembers?: Share[] }
  userState?: { user?: User }
  capabilityState?: {
    capabilities?: Partial<Capabilities['capabilities']>
    isInitialized?: boolean
  }
}

export function createMockStore({
  stubActions = true,
  authState = {},
  themeState = {},
  messagesState = {},
  modalsState = {},
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
      auth: { ...authState },
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
