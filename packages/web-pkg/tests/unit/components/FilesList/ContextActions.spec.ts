import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  mount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import ContextActions from '../../../../src/components/FilesList/ContextActions.vue'

import {
  useFileActionsAcceptShare,
  useFileActionsCopyQuickLink,
  useFileActionsRename,
  useFileActionsCopy
} from '../../../../src/composables'
import { computed, ref } from 'vue'
import { Action } from '../../../../src/composables/actions'

function createMockActionComposables(module) {
  const mockModule: Record<string, any> = {}
  for (const m of Object.keys(module)) {
    mockModule[m] = jest.fn(() => ({ actions: ref([]) }))
  }
  return mockModule
}

// jest.mock('../../../../src/composables/actions/files', () =>
//   createMockActionComposables(jest.requireActual('../../../../src/composables/actions/files'))
// )

// jest.mock('../../../../src/composables/actions/files/useFileActionsSetReadme', () =>
//   createMockActionComposables(
//     jest.requireActual('../../../../src/composables/actions/files/useFileActionsSetReadme')
//   )
// )

describe.skip('ContextActions', () => {
  describe('menu sections', () => {
    it('do not render when no action enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(0)
    })

    it('render enabled actions', () => {
      const enabledComposables = [
        useFileActionsAcceptShare,
        useFileActionsCopyQuickLink,
        useFileActionsRename,
        useFileActionsCopy
      ]
      for (const composable of enabledComposables) {
        jest.mocked(composable).mockImplementation(() => ({
          actions: computed(() => [mock<Action>({ isEnabled: () => true })])
        }))
      }

      const { wrapper } = getWrapper()
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(enabledComposables.length)
    })
  })
})

function getWrapper() {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.Files.getters.currentFolder.mockImplementation(() => '/')
  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks()
  }
  return {
    storeOptions,
    mocks,
    wrapper: mount(ContextActions, {
      props: {
        actionOptions: {
          space: mock<SpaceResource>(),
          resources: [mock<Resource>()]
        }
      },
      global: {
        mocks,
        provide: { ...mocks, currentSpace: mock<SpaceResource>() },
        stubs: { ...defaultStubs, 'action-menu-item': true },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
