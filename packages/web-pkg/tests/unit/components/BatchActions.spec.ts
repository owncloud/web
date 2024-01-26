import { defaultPlugins, mount } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client/src/helpers'
import BatchActions from '../../../src/components/BatchActions.vue'

const selectors = {
  actionMenuItemStub: 'action-menu-item-stub',
  batchActionsSquashed: '.oc-appbar-batch-actions-squashed'
}

describe('BatchActions', () => {
  describe('menu sections', () => {
    it('do not render when no action enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll(selectors.actionMenuItemStub).length).toBe(0)
    })

    it('render enabled actions', () => {
      const actions = [{}]
      const { wrapper } = getWrapper({ props: { actions } })
      expect(wrapper.findAll(selectors.actionMenuItemStub).length).toBe(actions.length)
    })
  })
  describe('limited screen space', () => {
    it('adds the squashed-class when limited screen space is available', () => {
      const { wrapper } = getWrapper({ props: { limitedScreenSpace: true } })
      expect(wrapper.find(selectors.batchActionsSquashed).exists()).toBeTruthy()
    })
    it('correctly tells the action item component to show tooltips when limited screen space is available', () => {
      const { wrapper } = getWrapper({ props: { actions: [{}], limitedScreenSpace: true } })
      expect(
        wrapper.findComponent<any>(selectors.actionMenuItemStub).props().showTooltip
      ).toBeTruthy()
    })
  })
})

function getWrapper({ props = {} } = {}) {
  return {
    wrapper: mount(BatchActions, {
      props: {
        items: [mock<Resource>()],
        ...props
      },
      global: {
        stubs: { 'action-menu-item': true },
        plugins: [...defaultPlugins()]
      }
    })
  }
}
