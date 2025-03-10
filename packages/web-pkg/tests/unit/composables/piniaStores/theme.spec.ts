import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { useThemeStore, WebThemeConfigType } from '../../../../src/composables/piniaStores'
import { mockDeep } from 'vitest-mock-extended'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed } from 'vue'

vi.mock('@vueuse/core', () => {
  return { useLocalStorage: vi.fn(() => ref('')), usePreferredDark: vi.fn(() => ref(false)) }
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
        vi.mocked(usePreferredDark).mockReturnValue(computed(() => isDark))
        vi.mocked(useLocalStorage).mockReturnValue(ref(null))

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
        vi.mocked(usePreferredDark).mockReturnValue(computed(() => true))
        vi.mocked(useLocalStorage).mockReturnValue(ref(null))

        const themeConfig = mockDeep<WebThemeConfigType>()
        themeConfig.themes = [{ name: 'light', designTokens: {}, isDark: false }]
        themeConfig.defaults = {}

        const store = useThemeStore()
        store.initializeThemes(themeConfig)

        expect(store.currentTheme.name).toEqual('light')
      })
    })
  })
})
