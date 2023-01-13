import showDetails from 'web-app-files/src/mixins/actions/showDetails'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

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
  })
})

function getWrapper() {
  const mocks = {
    ...defaultComponentMocks()
  }
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    mocks,
    storeOptions,
    wrapper: mount(Component, {
      global: { plugins: [...defaultPlugins(), store], mocks }
    })
  }
}
