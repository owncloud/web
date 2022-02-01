import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'

import ThemeSwitcher from 'web-runtime/src/components/Topbar/ThemeSwitcher.vue'
import stubs from '../../../../../../tests/unit/stubs'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

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

const spyChangeTheme = jest.spyOn(ThemeSwitcher.methods, 'changeTheme')

describe('ThemeSwitcher component', () => {
  describe('visually', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders a button, initially in light mode per default', async () => {
      window.matchMedia = darkModePreferred(false)
      const wrapper = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })

    it('renders a button, initially in dark mode if user prefers dark color sceme', async () => {
      window.matchMedia = darkModePreferred(true)
      const wrapper = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
      // await expect(spyChangeTheme).toHaveBeenCalledTimes(1)
    })

    it('toggles between themes upon click', async () => {
      window.matchMedia = darkModePreferred(false)
      const wrapper = getWrapper()
      expect(spyChangeTheme).toHaveBeenCalledTimes(0)

      await wrapper.find('.themeswitcher-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper).toMatchSnapshot()
      expect(spyChangeTheme).toHaveBeenCalledTimes(1)

      await wrapper.find('.themeswitcher-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper).toMatchSnapshot()
      expect(spyChangeTheme).toHaveBeenCalledTimes(2)
    })
  })

  describe('restores', () => {
    it('light theme if light theme is saved in localstorage', async () => {
      window.localStorage.setItem('oc_currentTheme', JSON.stringify(lightTheme))
      window.localStorage.setItem('oc_colorMode', 'light')
      const wrapper = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    it('dark theme if dark theme is saved in localstorage', async () => {
      window.localStorage.setItem('oc_currentTheme', JSON.stringify(darkTheme))
      window.localStorage.setItem('oc_colorMode', 'dark')
      const wrapper = getWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
  })
})

function darkModePreferred(enabled = false) {
  return function () {
    return {
      matches: enabled,
      media: "'(prefers-color-scheme: dark)'",
      addListener: function () {},
      removeListener: function () {}
    }
  }
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
          currentTheme: {
            designTokens: {
              colorPalette: {
                'background-accentuate': 'lime'
              }
            }
          }
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
