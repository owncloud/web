import { useFileActionsShowDetails } from '../../../../../src/composables/actions'
import { eventBus } from '@ownclouders/web-pkg/src/services/eventBus'
import { SideBarEventTopics } from '@ownclouders/web-pkg'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'
import { Resource } from 'web-client'
import { useStore } from '@ownclouders/web-pkg/src/composables'

describe('showDetails', () => {
  describe('handler', () => {
    it('should trigger the open sidebar event', () => {
      const mocks = defaultComponentMocks()
      getComposableWrapper(
        () => {
          const store = useStore()
          const { actions } = useFileActionsShowDetails({ store })

          const busStub = jest.spyOn(eventBus, 'publish')
          const resources = [{ id: 1, path: '/folder' }] as Resource[]
          unref(actions)[0].handler({ space: null, resources })
          expect(busStub).toHaveBeenCalledWith(SideBarEventTopics.open)
        },
        { mocks, provide: mocks, store: createStore(defaultStoreMockOptions) }
      )
    })
  })
})
