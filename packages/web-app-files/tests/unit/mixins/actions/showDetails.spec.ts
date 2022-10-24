import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import showDetails from 'web-app-files/src/mixins/actions/showDetails'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from '../../../../src/composables/sideBar'
import { buildSpace } from 'web-client/src/helpers'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component: any = {
  template: '<div></div>',
  mixins: [showDetails]
}

describe('showDetails', () => {
  describe('method "$_showDetails_trigger"', () => {
    it('should trigger the open sidebar event', () => {
      const busStub = jest.spyOn(eventBus, 'publish')
      const { wrapper } = getWrapper()
      const resources = [{ id: 1, path: '/folder' }]
      wrapper.vm.$_showDetails_trigger({ resources })
      expect(busStub).toHaveBeenCalledWith(SideBarEventTopics.open)
    })
    it('should load space members if a project space is selected', () => {
      const busStub = jest.spyOn(eventBus, 'publish')
      const { wrapper } = getWrapper()
      const loadSpaceMembersStub = jest.spyOn(wrapper.vm, 'loadSpaceMembers')
      const resources = [buildSpace({ id: 1, driveType: 'project' })]
      wrapper.vm.$_showDetails_trigger({ resources })
      expect(busStub).toHaveBeenCalledWith(SideBarEventTopics.open)
      expect(loadSpaceMembersStub).toHaveBeenCalled()
    })
  })
})

function getWrapper() {
  const mocks = {
    ...defaultComponentMocks()
  }

  const storeOptions = {
    ...defaultStoreMockOptions
  }

  const store = createStore(Vuex.Store, storeOptions)
  return {
    mocks,
    storeOptions,
    wrapper: mount(Component, {
      localVue,
      mocks,
      store
    })
  }
}
