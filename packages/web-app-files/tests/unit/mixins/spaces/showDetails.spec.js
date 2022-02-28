import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import ShowDetails from '@files/src/mixins/spaces/actions/showDetails.js'
import { createLocationSpaces } from '../../../../src/router'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [ShowDetails]
}

describe('showDetails', () => {
  describe('method "$_showDetails_trigger"', () => {
    it('should trigger the sidebar for one resource', async () => {
      const wrapper = getWrapper()
      const setSelectionStub = jest.spyOn(wrapper.vm, 'SET_FILE_SELECTION')
      const openSidebarStub = jest.spyOn(wrapper.vm, 'openSidebar')
      await wrapper.vm.$_showDetails_trigger({ resources: [{ id: 1 }] })

      expect(setSelectionStub).toHaveBeenCalledTimes(1)
      expect(openSidebarStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the sidebar without any resource', async () => {
      const wrapper = getWrapper()
      const setSelectionStub = jest.spyOn(wrapper.vm, 'SET_FILE_SELECTION')
      const openSidebarStub = jest.spyOn(wrapper.vm, 'openSidebar')
      await wrapper.vm.$_showDetails_trigger({ resources: [] })

      expect(setSelectionStub).toHaveBeenCalledTimes(0)
      expect(openSidebarStub).toHaveBeenCalledTimes(0)
    })
  })
})

function getWrapper() {
  return mount(Component, {
    localVue,
    mocks: {
      $router: {
        currentRoute: createLocationSpaces('files-spaces-projects'),
        resolve: (r) => {
          return { href: r.name }
        }
      },
      $gettext: jest.fn()
    },
    store: createStore(Vuex.Store, {
      modules: {
        Files: {
          namespaced: true,
          mutations: {
            SET_FILE_SELECTION: jest.fn()
          },
          modules: {
            sidebar: {
              namespaced: true,
              actions: {
                close: jest.fn(),
                open: jest.fn()
              }
            }
          }
        }
      }
    })
  })
}
