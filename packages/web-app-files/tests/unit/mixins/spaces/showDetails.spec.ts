import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import ShowDetails from 'files/src/mixins/spaces/actions/showDetails'
import { defaultComponentMocks } from '../../../../../../tests/unit/mocks/defaultComponentMocks'
import { defaultStoreMockOptions } from '../../../../../../tests/unit/mocks/store/defaultStoreMockOptions'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  template: '<div></div>',
  mixins: [ShowDetails]
} as any

describe('showDetails', () => {
  describe('method "$_showDetails_trigger"', () => {
    it('should trigger the sidebar for one resource', async () => {
      const { wrapper } = getWrapper()
      const loadSpaceMembersStub = jest.spyOn(wrapper.vm, 'loadSpaceMembers')
      const setSelectionStub = jest.spyOn(wrapper.vm, 'SET_FILE_SELECTION')
      const openSidebarStub = jest.spyOn(wrapper.vm, '$_showDetails_openSideBar')
      await wrapper.vm.$_showDetails_trigger({ resources: [{ id: 1 }] })

      expect(setSelectionStub).toHaveBeenCalledTimes(1)
      expect(openSidebarStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the sidebar without any resource', async () => {
      const { wrapper } = getWrapper()
      const loadSpaceMembersStub = jest.spyOn(wrapper.vm, 'loadSpaceMembers')
      const setSelectionStub = jest.spyOn(wrapper.vm, 'SET_FILE_SELECTION')
      const openSidebarStub = jest.spyOn(wrapper.vm, '$_showDetails_openSideBar')
      await wrapper.vm.$_showDetails_trigger({ resources: [] })

      expect(setSelectionStub).toHaveBeenCalledTimes(0)
      expect(openSidebarStub).toHaveBeenCalledTimes(0)
    })
  })
})

function getWrapper() {
  const mocks = {
    ...defaultComponentMocks()
  }

  const store = createStore(Vuex.Store, defaultStoreMockOptions)

  return {
    mocks,
    store,
    wrapper: mount(Component, {
      localVue,
      mocks,
      store
    })
  }
}
