import { createTestingPinia } from '@pinia/testing'
import defaultTheme from '../../../web-runtime/themes/owncloud/theme.json'
import { Modal, WebThemeType } from '../../../web-pkg/src/composables/piniaStores'

export type PiniaMockOptions = {
  stubActions?: boolean
  themeState?: { availableThemes?: WebThemeType[]; currentTheme?: WebThemeType }
  modalsState?: { modals?: Modal[] }
}

export function createMockStore({
  stubActions = true,
  themeState = {},
  modalsState = {}
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
      }
    }
  })
}
