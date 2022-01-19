import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'

import ThemeSwitcher from 'web-runtime/src/components/ThemeSwitcher.vue'
import stubs from '../../../../../tests/unit/stubs'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const spyChangeTheme = jest.spyOn(ThemeSwitcher.methods, 'changeTheme')

describe('ThemeSwitcher component', () => {
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
            default: {
              designTokens: {
                colorPalette: {
                  'background-accentuate': 'lime'
                }
              }
            },
            'default-dark': {
              designTokens: {
                colorPalette: {
                  'background-accentuate': 'gold'
                }
              }
            }
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
