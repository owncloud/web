import { defaultPlugins, defaultStoreMockOptions, mount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client/src/helpers'
import ContextActions from '../../../../src/components/Groups/ContextActions.vue'
import {
  useGroupActionsDelete,
  useGroupActionsEdit
} from 'web-app-admin-settings/src/composables/actions'
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

jest.mock('web-app-admin-settings/src/composables/actions/groups/useGroupActionsDelete', () =>
  createMockActionComposables(
    jest.requireActual(
      'web-app-admin-settings/src/composables/actions/groups/useGroupActionsDelete'
    )
  )
)

jest.mock('web-app-admin-settings/src/composables/actions/groups/useGroupActionsEdit', () =>
  createMockActionComposables(
    jest.requireActual('web-app-admin-settings/src/composables/actions/groups/useGroupActionsEdit')
  )
)

const selectors = {
  actionMenuItemStub: 'action-menu-item-stub'
}

describe.skip('ContextActions', () => {
  describe('menu sections', () => {
    it('do not render when no action enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll(selectors.actionMenuItemStub).length).toBe(0)
    })

    it('render enabled actions', () => {
      const enabledComposables = [useGroupActionsDelete, useGroupActionsEdit]
      jest.mocked(useGroupActionsDelete).mockImplementation(() => ({
        actions: computed(() => [mock<Action>({ isEnabled: () => true })]),
        deleteGroups: null
      }))
      jest.mocked(useGroupActionsEdit).mockImplementation(() => ({
        actions: computed(() => [mock<Action>({ isEnabled: () => true })])
      }))
      const { wrapper } = getWrapper()
      expect(wrapper.findAll(selectors.actionMenuItemStub).length).toBe(enabledComposables.length)
    })
  })
})

function getWrapper() {
  const storeOptions = { ...defaultStoreMockOptions }
  return {
    storeOptions,
    wrapper: mount(ContextActions, {
      props: {
        items: [mock<Resource>()]
      },
      global: {
        stubs: { 'action-menu-item': true },
        plugins: [...defaultPlugins()]
      }
    })
  }
}
