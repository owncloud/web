import { useShowDetails } from 'web-app-files/src/mixins/actions/showDetails'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'

describe('showDetails', () => {
  describe('method "$_showDetails_trigger"', () => {
    it('should trigger the open sidebar event', () => {
      getComposableWrapper(
        () => {
          const { actions } = useShowDetails()

          const busStub = jest.spyOn(eventBus, 'publish')
          const resources = [{ id: 1, path: '/folder' }]
          unref(actions)[0].handler({ resources })
          expect(busStub).toHaveBeenCalledWith(SideBarEventTopics.open)
        },
        { mocks: defaultComponentMocks(), store: createStore(defaultStoreMockOptions) }
      )
    })
  })
})
