import { createLocalVue, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueCompositionAPI from '@vue/composition-api'

import SharesPanel from 'web-app-files/src/components/SideBar/Shares/SharesPanel.vue'
const localVue = createLocalVue()
localVue.use(VueCompositionAPI)

localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
const ocLoaderStubSelector = 'oc-loader-stub'

jest.mock('web-pkg/src/composables/reactivity')
describe('SharesPanel', () => {
  describe('when loading is set to true', () => {
    it('should show the oc loader', () => {
      const wrapper = getShallowWrapper({ sharesLoading: true })

      expect(wrapper.find(ocLoaderStubSelector).exists()).toBeTruthy()
      expect(wrapper.find(ocLoaderStubSelector).attributes().arialabel).toBe(
        'Loading list of shares'
      )
    })
  })
  describe('when sharesLoading is set to false', () => {
    it('should not show the oc loader', () => {
      const wrapper = getShallowWrapper()
      expect(wrapper.find('oc-loader-stub').exists()).toBeFalsy()
    })
  })

  function getShallowWrapper({ sharesLoading = false } = {}) {
    return shallowMount(SharesPanel, {
      localVue,
      provide: {
        activePanel: null,
        displayedItem: {},
        displayedSpace: {},
        spaceMembers: { value: [] }
      },
      store: new Vuex.Store({
        modules: {
          Files: {
            namespaced: true,
            state: {
              highlightedFile: { name: '1' }
            },
            getters: {
              highlightedFile: (state) => {
                return state.highlightedFile
              }
            },
            mutations: {
              SET_HIGHLIGHTED_FILE(state, file) {
                state.highlightedFile = file
              }
            }
          }
        }
      }),
      stubs: {
        'file-shares': true
      },
      setup: () => {
        return {
          sharesLoading: sharesLoading,
          graphClient: jest.fn()
        }
      }
    })
  }
})
