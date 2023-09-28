import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  mount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client/src/helpers'
import ActionsPanel from '../../../../../src/components/Spaces/SideBar/ActionsPanel.vue'
import {
  useSpaceActionsDisable,
  useSpaceActionsEditDescription,
  useSpaceActionsEditQuota,
  useSpaceActionsRename
} from '@ownclouders/web-pkg'
import { computed, ref } from 'vue'
import { Action } from '@ownclouders/web-pkg'

function createMockActionComposables(module) {
  const mockModule: Record<string, any> = {}
  for (const m of Object.keys(module)) {
    mockModule[m] = jest.fn(() => ({ actions: ref([]) }))
  }
  return mockModule
}

jest.mock('@ownclouders/web-pkg', () =>
  createMockActionComposables(jest.requireActual('@ownclouders/web-pkg'))
)

describe('ActionsPanel', () => {
  describe('menu sections', () => {
    it('do not render when no action enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(0)
    })

    it('render enabled actions', () => {
      const enabledComposables = [
        useSpaceActionsRename,
        useSpaceActionsEditDescription,
        useSpaceActionsEditQuota,
        useSpaceActionsDisable
      ]

      for (const composable of enabledComposables) {
        jest.mocked(composable).mockImplementation(() => ({
          actions: computed(() => [mock<Action>({ isEnabled: () => true })]),
          checkName: null,
          renameSpace: null,
          editDescriptionSpace: null,
          selectedSpace: null,
          modalOpen: null,
          closeModal: null,
          spaceQuotaUpdated: null,
          disableSpaces: null
        }))
      }

      const { wrapper } = getWrapper()
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(enabledComposables.length)
    })
  })
})

function getWrapper() {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks()
  }
  return {
    storeOptions,
    mocks,
    wrapper: mount(ActionsPanel, {
      props: {
        items: [mock<Resource>()]
      },
      global: {
        mocks,
        stubs: { ...defaultStubs, 'action-menu-item': true },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
