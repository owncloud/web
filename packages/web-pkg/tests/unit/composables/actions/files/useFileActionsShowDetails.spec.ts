import {
  SideBarEventTopics,
  eventBus,
  useFileActionsShowDetails,
  useStore
} from '../../../../../src'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'
import { Resource } from '@ownclouders/web-client'

describe('showDetails', () => {
  describe('handler', () => {
    it('should trigger the open sidebar event', () => {
      const mocks = defaultComponentMocks()
      getComposableWrapper(
        () => {
          const store = useStore()
          const { actions } = useFileActionsShowDetails({ store })

          const busStub = jest.spyOn(eventBus, 'publish')
          const resources = [{ id: '1', path: '/folder' }] as Resource[]
          unref(actions)[0].handler({ space: null, resources })
          expect(busStub).toHaveBeenCalledWith(SideBarEventTopics.open)
        },
        { mocks, provide: mocks, store: createStore(defaultStoreMockOptions) }
      )
    })
  })
})
