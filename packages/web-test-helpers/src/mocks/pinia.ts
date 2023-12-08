import { createTestingPinia as createCustomThemeStore } from '@pinia/testing'
import defaultTheme from '../../../web-runtime/themes/owncloud/theme.json'

export { createCustomThemeStore }

export function createMockThemeStore({ hasOnlyOneTheme = false } = {}) {
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

  return createCustomThemeStore({
    stubActions: false,
    initialState: {
      theme: {
        currentTheme: {
          ...defaultOwnCloudTheme.defaults,
          ...defaultOwnCloudTheme.themes[0]
        },
        availableThemes: hasOnlyOneTheme
          ? [defaultOwnCloudTheme.themes[0]]
          : defaultOwnCloudTheme.themes
      }
    }
  })
}
