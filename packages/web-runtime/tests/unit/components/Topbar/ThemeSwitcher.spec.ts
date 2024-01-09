import { WebThemeType, useThemeStore } from '@ownclouders/web-pkg'
import { mock } from 'jest-mock-extended'
import ThemeSwitcher from 'web-runtime/src/components/Topbar/ThemeSwitcher.vue'
import defaultTheme from 'web-runtime/themes/owncloud/theme.json'
import { defaultPlugins, defaultStubs, mount } from 'web-test-helpers'

const defaultOwnCloudTheme = {
  defaults: {
    ...defaultTheme.clients.web.defaults,
    common: defaultTheme.common
  },
  themes: defaultTheme.clients.web.themes
}

describe('ThemeSwitcher component', () => {
  describe('visually', () => {
    beforeEach(() => {
      mockDarkModePreferred(false)
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('does not render anything if only one theme is available', async () => {
      const { wrapper } = getWrapper({ hasOnlyOneTheme: true })
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toMatchSnapshot()
    })

    describe('if there is exactly two themes, one dark and one light', () => {
      it('renders a button, initially in light mode per default', async () => {
        const { wrapper } = getWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.html()).toMatchSnapshot()
      })

      it('renders a button, initially in dark mode if user prefers dark color scheme', async () => {
        mockDarkModePreferred(true)
        const { wrapper } = getWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.html()).toMatchSnapshot()
      })

      it('toggles between themes upon click', async () => {
        const { wrapper } = getWrapper()
        await wrapper.find('.themeswitcher-btn').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.html()).toMatchSnapshot()
        await wrapper.find('.themeswitcher-btn').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.html()).toMatchSnapshot()
      })
    })

    describe('if there are more than two themes', () => {
      it.todo('renders a button, with a dropdown menu')
    })
  })

  describe('restores', () => {
    it('light theme if light theme is saved in localstorage', async () => {
      const themeStore = useThemeStore()
      window.localStorage.setItem('oc_currentThemeName', 'Light Theme')
      const { wrapper } = getWrapper({ hasOnlyOneTheme: false })
      themeStore.initializeThemes(defaultOwnCloudTheme)
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('dark theme if dark theme is saved in localstorage', async () => {
      const themeStore = useThemeStore()
      window.localStorage.setItem('oc_currentThemeName', 'Dark Theme')
      const { wrapper } = getWrapper()
      themeStore.initializeThemes(defaultOwnCloudTheme)
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function mockDarkModePreferred(enabled = false) {
  // matchMedia is not implemented in JSDOM, needs to be mocked
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: enabled,
      media: "'(prefers-color-scheme: dark)'",
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  })
}

function getWrapper({ hasOnlyOneTheme = false } = {}) {
  const availableThemes = hasOnlyOneTheme
    ? [defaultTheme.clients.web.themes[0]]
    : defaultTheme.clients.web.themes

  return {
    wrapper: mount(ThemeSwitcher, {
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              stubActions: false,
              themeState: {
                availableThemes,
                currentTheme: mock<WebThemeType>({
                  ...defaultOwnCloudTheme.defaults,
                  ...defaultOwnCloudTheme.themes[0]
                })
              }
            }
          })
        ],
        stubs: { ...defaultStubs, 'oc-icon': true }
      }
    })
  }
}
