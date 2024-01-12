import { createTestingPinia } from '@pinia/testing'
import defaultTheme from '../../../web-runtime/themes/owncloud/theme.json'
import { User } from '../../../web-client/src/generated'
import { Message, Modal, WebThemeType } from '../../../web-pkg/src/composables/piniaStores'
import { mock } from 'jest-mock-extended'
import { SpaceResource } from '../../../web-client/src'
import { Share } from '../../../web-client/src/helpers'

export { createTestingPinia }

export type PiniaMockOptions = {
  stubActions?: boolean
  themeState?: { availableThemes?: WebThemeType[]; currentTheme?: WebThemeType }
  messagesState?: { messages?: Message[] }
  modalsState?: { modals?: Modal[] }
  spacesState?: { spaces?: SpaceResource[]; spaceMembers?: Share[] }
  userState?: { user?: User }
}

export function createMockStore({
  stubActions = true,
  themeState = {},
  messagesState = {},
  modalsState = {},
  spacesState = {},
  userState = {}
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
      user: { user: { ...mock<User>({ id: '1' }), ...(userState?.user && { ...userState.user }) } }
    }
  })
}
