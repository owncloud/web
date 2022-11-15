import Vuex from 'vuex'
import { mount } from '@vue/test-utils'
import SpaceHeader from 'web-app-files/src/components/Spaces/SpaceHeader.vue'
import { createStore } from 'vuex-extensions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { buildSpace } from 'web-client/src/helpers'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn()
  }))

afterEach(() => jest.clearAllMocks())

describe('SpaceHeader', () => {
  it('should add the "squashed"-class when the sidebar is opened', () => {
    const wrapper = getWrapper({ space: buildSpace({ id: 1 }), sideBarOpen: true })
    expect(wrapper.find('.space-header-squashed').exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  describe('space image', () => {
    it('should show the default image if no other image is set', () => {
      const wrapper = getWrapper({ space: buildSpace({ id: 1 }) })
      expect(wrapper.find('.space-header-image-default').exists()).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    })
    it('should show the set image', () => {
      const spaceMock = { spaceImageData: { webDavUrl: '/' } }
      const wrapper = getWrapper({ space: { ...buildSpace({ id: 1 }), ...spaceMock } })
      expect(wrapper.find('.space-header-image-default').exists()).toBeFalsy()
      expect(wrapper.find('.space-header-image img').exists()).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    })
  })
})

function getWrapper({ space = {}, sideBarOpen = false }) {
  const localVue = defaultLocalVue()
  const mocks = {
    ...defaultComponentMocks()
  }
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: {
      ...defaultStoreMockOptions.modules,
      runtime: {
        namespaced: true,
        modules: {
          spaces: {
            namespaced: true,
            getters: {
              spaceMembers: () => []
            }
          }
        }
      }
    }
  }
  const store = createStore(Vuex.Store, storeOptions)
  return mount(SpaceHeader, {
    localVue,
    mocks,
    store,
    propsData: {
      space,
      sideBarOpen
    }
  })
}
