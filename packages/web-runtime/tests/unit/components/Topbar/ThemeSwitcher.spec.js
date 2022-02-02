import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import CompositionApi from '@vue/composition-api'

import ThemeSwitcher from 'web-runtime/src/components/Topbar/ThemeSwitcher.vue'
import stubs from '../../../../../../tests/unit/stubs'
import { themeNameDark, themeNameLight } from '../../../../src/composables'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
localVue.use(CompositionApi)

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

const spyToggleTheme = jest.spyOn(ThemeSwitcher.methods, 'toggleTheme')

describe('ThemeSwitcher component', () => {
  describe('visually', () => {
    beforeEach(() => {
      mockDarkModePreferred(false)
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('renders a button, initially in light mode per default', async () => {
      const wrapper = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })

    it('renders a button, initially in dark mode if user prefers dark color scheme', async () => {
      mockDarkModePreferred(true)
      const wrapper = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })

    it('toggles between themes upon click', async () => {
      const wrapper = getWrapper()
      expect(spyToggleTheme).toHaveBeenCalledTimes(0)

      await wrapper.find('.themeswitcher-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper).toMatchSnapshot()
      expect(spyToggleTheme).toHaveBeenCalledTimes(1)

      await wrapper.find('.themeswitcher-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper).toMatchSnapshot()
      expect(spyToggleTheme).toHaveBeenCalledTimes(2)
    })
  })

  describe('restores', () => {
    it('light theme if light theme is saved in localstorage', async () => {
      window.localStorage.setItem('oc_currentThemeName', themeNameLight)
      const wrapper = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    it('dark theme if dark theme is saved in localstorage', async () => {
      window.localStorage.setItem('oc_currentThemeName', themeNameDark)
      const wrapper = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
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
  return mount(ThemeSwitcher, {
    store: new Vuex.Store({
      getters: {
        configuration: () => ({
          themes: {
            default: lightTheme,
            'default-dark': darkTheme
          },
          currentTheme: lightTheme
        })
      },
      actions: {
        loadTheme: jest.fn()
      }
    }),
    localVue,
    stubs: { ...stubs, 'oc-button': false },
    directives: {
      'oc-tooltip': jest.fn()
    }
  })
}
