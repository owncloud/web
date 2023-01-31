import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  getActionMixinMocks,
  mount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from 'web-client/src/helpers'
import ActionsPanel from '../../../../../src/components/Spaces/SideBar/ActionsPanel.vue'

const mixins = [
  '$_rename_items',
  '$_editDescription_items',
  '$_editQuota_items',
  '$_disable_items',
  '$_restore_items',
  '$_delete_items'
]

const Component = {
  ...ActionsPanel,
  mixins
}

describe('ActionsPanel', () => {
  describe('menu sections', () => {
    it('do not render when no action enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(0)
    })

    it('render enabled actions', () => {
      const enabledActions = [
        '$_rename_items',
        '$_editDescription_items',
        '$_editQuota_items',
        '$_disable_items'
      ]
      const { wrapper } = getWrapper({ enabledActions })
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(enabledActions.length)
    })
  })
})

function getWrapper({ enabledActions = [] } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks(),
    ...getActionMixinMocks({ actions: mixins, enabledActions })
  }
  return {
    storeOptions,
    mocks,
    wrapper: mount(Component, {
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
