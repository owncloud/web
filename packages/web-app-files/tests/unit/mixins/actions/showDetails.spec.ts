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
import { Resource } from 'web-client/src'
import { useStore } from 'web-pkg/src'

describe('showDetails', () => {
  describe('method "$_showDetails_trigger"', () => {
    it('should trigger the open sidebar event', () => {
      getComposableWrapper(
        () => {
          const store = useStore()
          const { actions } = useShowDetails({ store })

          const busStub = jest.spyOn(eventBus, 'publish')
          const resources = [{ id: 1, path: '/folder' }] as Resource[]
          unref(actions)[0].handler({ space: null, resources })
          expect(busStub).toHaveBeenCalledWith(SideBarEventTopics.open)
        },
        { mocks: defaultComponentMocks(), store: createStore(defaultStoreMockOptions) }
      )
    })
  })
})
