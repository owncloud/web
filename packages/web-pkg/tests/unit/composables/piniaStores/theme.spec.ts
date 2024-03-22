import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { useThemeStore, WebThemeConfigType } from '../../../../src/composables/piniaStores'
import { mockDeep } from 'jest-mock-extended'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'

jest.mock('@vueuse/core', () => {
  return { useLocalStorage: jest.fn(() => ref('')), usePreferredDark: jest.fn(() => ref(false)) }
})

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initializeThemes', () => {
    it('sets availableThemes', () => {
      const themeConfig = mockDeep<WebThemeConfigType>()
      themeConfig.themes = [
        { name: 'light', designTokens: {}, isDark: false },
        { name: 'dark', designTokens: {}, isDark: true }
      ]

      const store = useThemeStore()
      store.initializeThemes(themeConfig)

      expect(store.availableThemes.length).toBe(themeConfig.themes.length)
    })
    describe('currentTheme', () => {
      it.each([true, false])('gets set based on the OS setting', (isDark) => {
        jest.mocked(usePreferredDark).mockReturnValue(ref(isDark))
        jest.mocked(useLocalStorage).mockReturnValue(ref(null))

        const themeConfig = mockDeep<WebThemeConfigType>()
        themeConfig.themes = [
          { name: 'light', designTokens: {}, isDark: false },
          { name: 'dark', designTokens: {}, isDark: true }
        ]
        themeConfig.defaults = {}

        const store = useThemeStore()
        store.initializeThemes(themeConfig)

        expect(store.currentTheme.name).toEqual(
          themeConfig.themes.find((t) => t.isDark === isDark).name
        )
      })
      it('falls back to the first theme if no match for the OS setting is found', () => {
        jest.mocked(usePreferredDark).mockReturnValue(ref(true))
        jest.mocked(useLocalStorage).mockReturnValue(ref(null))

        const themeConfig = mockDeep<WebThemeConfigType>()
        themeConfig.themes = [{ name: 'light', designTokens: {}, isDark: false }]
        themeConfig.defaults = {}

        const store = useThemeStore()
        store.initializeThemes(themeConfig)

        expect(store.currentTheme.name).toEqual('light')
      })
    })
    describe('toggleTheme', () => {
      it('toggles the themes between light and dark mode', () => {
        const themeConfig = mockDeep<WebThemeConfigType>()
        themeConfig.defaults = {}
        themeConfig.themes = [
          { name: 'light', designTokens: {}, isDark: false },
          { name: 'dark', designTokens: {}, isDark: true }
        ]

        const store = useThemeStore()
        store.initializeThemes(themeConfig)

        expect(store.currentTheme.name).toEqual('light')

        store.toggleTheme()

        expect(store.currentTheme.name).toEqual('dark')
      })
    })
  })
})
