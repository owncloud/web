import ThemeSwitcher from 'web-runtime/src/components/Topbar/ThemeSwitcher.vue'
import {
  createStore,
  defaultPlugins,
  defaultStubs,
  mount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const lightTheme = {
  designTokens: {
    colorPalette: {
      'background-accentuate': 'lime'
    }
  }
}

const darkTheme = {
  designTokens: {
    colorPalette: {
      'background-accentuate': 'gold'
    }
  }
}

const spyToggleTheme = jest.spyOn((ThemeSwitcher as any).methods, 'toggleTheme')

describe('ThemeSwitcher component', () => {
  describe('visually', () => {
    beforeEach(() => {
      mockDarkModePreferred(false)
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

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
      expect(spyToggleTheme).toHaveBeenCalledTimes(0)

      await wrapper.find('.themeswitcher-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toMatchSnapshot()
      expect(spyToggleTheme).toHaveBeenCalledTimes(1)

      await wrapper.find('.themeswitcher-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toMatchSnapshot()
      expect(spyToggleTheme).toHaveBeenCalledTimes(2)
    })
  })

  describe('restores', () => {
    it('light theme if light theme is saved in localstorage', async () => {
      window.localStorage.setItem('oc_currentThemeName', 'themeNameLight')
      const { wrapper } = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('dark theme if dark theme is saved in localstorage', async () => {
      window.localStorage.setItem('oc_currentThemeName', 'themeNameDark')
      const { wrapper } = getWrapper()
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

function getWrapper() {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.configuration.mockImplementation(() => ({
    themes: {
      default: lightTheme,
      'default-dark': darkTheme
    },
    currentTheme: lightTheme
  }))
  const store = createStore(storeOptions)
  return {
    wrapper: mount(ThemeSwitcher, {
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: { ...defaultStubs, 'oc-icon': true }
      }
    })
  }
}
