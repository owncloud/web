import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  mount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import ContextActions from 'web-app-files/src/components/FilesList/ContextActions.vue'

import {
  useAcceptShare,
  useCreateQuickLink,
  useRename,
  useCopy
} from 'web-app-files/src/mixins/actions'
import { computed, ref } from 'vue'
import { Action } from 'web-pkg/src/composables/actions'

function createMockActionComposables(module) {
  const mockModule: Record<string, any> = {}
  for (const m of Object.keys(module)) {
    mockModule[m] = jest.fn(() => ({ actions: ref([]) }))
  }
  return mockModule
}

jest.mock('web-app-files/src/mixins/actions', () =>
  createMockActionComposables(jest.requireActual('web-app-files/src/mixins/actions'))
)

jest.mock('web-app-files/src/mixins/spaces/actions/setImage', () =>
  createMockActionComposables(
    jest.requireActual('web-app-files/src/mixins/spaces/actions/setImage')
  )
)

jest.mock('web-pkg/src/mixins/spaces/setReadme', () =>
  createMockActionComposables(jest.requireActual('web-pkg/src/mixins/spaces/setReadme'))
)

describe('ContextActions', () => {
  describe('menu sections', () => {
    it('do not render when no action enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(0)
    })

    it('render enabled actions', () => {
      const enabledComposables = [useAcceptShare, useCreateQuickLink, useRename, useCopy]
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
        space: mock<SpaceResource>(),
        items: [mock<Resource>()]
      },
      global: {
        mocks,
        provide: { currentSpace: mock<SpaceResource>() },
        stubs: { ...defaultStubs, 'action-menu-item': true },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
