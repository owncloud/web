import { defaultPlugins, defaultStoreMockOptions, mount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from 'web-client/src/helpers'
import BatchActions from '../../../../src/components/Groups/BatchActions.vue'

const mixins = ['$_delete_items']
const selectors = {
  actionMenuItemStub: 'action-menu-item-stub',
  batchActionsSquashed: '.oc-groups-appbar-batch-actions-squashed'
}

describe('BatchActions', () => {
  describe('menu sections', () => {
    it('do not render when no action enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll(selectors.actionMenuItemStub).length).toBe(0)
    })

    it('render enabled actions', () => {
      const enabledActions = ['$_delete_items']
      const { wrapper } = getWrapper({ enabledActions })
      expect(wrapper.findAll(selectors.actionMenuItemStub).length).toBe(enabledActions.length)
    })
  })
  describe('limited screen space', () => {
    it('adds the squashed-class when limited screen space is available', () => {
      const { wrapper } = getWrapper({ props: { limitedScreenSpace: true } })
      expect(wrapper.find(selectors.batchActionsSquashed).exists()).toBeTruthy()
    })
    it('correctly tells the action item component to show tooltips when limited screen space is available', () => {
      const enabledActions = ['$_delete_items']
      const { wrapper } = getWrapper({ enabledActions, props: { limitedScreenSpace: true } })
      expect(
        wrapper.findComponent<any>(selectors.actionMenuItemStub).props().showTooltip
      ).toBeTruthy()
    })
  })
})

function getWrapper({ enabledActions = [], props = {} } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  const mocks = getMixinMocks(enabledActions)
  return {
    storeOptions,
    mocks,
    wrapper: mount(
      { ...BatchActions, mixins },
      {
        props: {
          items: [mock<Resource>()],
          ...props
        },
        global: {
          mocks,
          stubs: { 'action-menu-item': true },
          plugins: [...defaultPlugins()]
        }
      }
    )
  }
}

const getMixinMocks = (enabledActions) => {
  const mixinMocks = {}
  for (const mixin of mixins) {
    const isEnabled = !!enabledActions.includes(mixin)
    mixinMocks[mixin] = [{ isEnabled: () => isEnabled, name: '', items: [] }]
  }
  return mixinMocks
}
