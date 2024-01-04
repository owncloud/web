import { createTestingPinia } from '@pinia/testing'
import defaultTheme from '../../../web-runtime/themes/owncloud/theme.json'
import { User } from '../../../web-client/src/generated'
import { Modal, WebThemeType } from '../../../web-pkg/src/composables/piniaStores'
import { mock } from 'jest-mock-extended'

export { createTestingPinia }

export type PiniaMockOptions = {
  stubActions?: boolean
  themeState?: { availableThemes?: WebThemeType[]; currentTheme?: WebThemeType }
  modalsState?: { modals?: Modal[] }
  userState?: { user?: User }
}

export function createMockStore({
  stubActions = true,
  themeState = {},
  modalsState = {},
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
      user: { user: { ...mock<User>({ id: '1' }), ...(userState?.user && { ...userState.user }) } }
    }
  })
}
