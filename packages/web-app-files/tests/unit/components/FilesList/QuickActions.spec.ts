import { ActionExtension, useEmbedMode } from '@ownclouders/web-pkg'
import QuickActions from '../../../../src/components/FilesList/QuickActions.vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { useExtensionRegistry } from '@ownclouders/web-pkg'
import { mock } from 'vitest-mock-extended'
import { ref } from 'vue'
import { useExtensionRegistryMock } from 'web-test-helpers/src/mocks/useExtensionRegistryMock'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...((await importOriginal()) as any),
  useEmbedMode: vi.fn(),
  useExtensionRegistry: vi.fn()
}))

const collaboratorAction = {
  isEnabled: vi.fn(() => true),
  handler: vi.fn(),
  icon: 'group-add',
  id: 'collaborators',
  name: 'show-shares',
  label: () => 'Add people'
}

const quicklinkAction = {
  isEnabled: vi.fn(() => false),
  handler: vi.fn(),
  icon: 'link-add',
  id: 'quicklink',
  name: 'copy-quicklink',
  label: () => 'Create and copy quicklink'
}

const testItem = {
  icon: 'file',
  name: 'lorem.txt',
  path: '/lorem.txt',
  size: '12220'
}

describe('QuickActions', () => {
  describe('when multiple actions are provided', () => {
    const { wrapper } = getWrapper()

    it('should display all action buttons where "displayed" is set to true', () => {
      const actionButtons = wrapper.findAll('.oc-button')
      // there are two items provided as actions, with only one item set to display
      expect(actionButtons.length).toBe(1)

      const actionButton = actionButtons.at(0)
      const iconEl = actionButton.find('oc-icon-stub')

      expect(actionButton.exists()).toBeTruthy()
      expect(actionButton.attributes().class).toContain('files-quick-action-show-shares')
      expect(iconEl.exists()).toBeTruthy()
      expect(iconEl.attributes().name).toBe('group-add')
      expect(actionButton.attributes('aria-label')).toBe('Add people')
    })

    it('should not display action buttons where "displayed" is set to false', () => {
      const linkActionButton = wrapper.find('.files-quick-action-copy-quicklink')

      expect(linkActionButton.exists()).toBeFalsy()
    })
  })

  describe('action handler', () => {
    it('should call action handler on click', async () => {
      const { wrapper } = getWrapper()
      const handlerAction = collaboratorAction.handler.mockImplementation(() => undefined)

      const actionButton = wrapper.find('.oc-button')
      await actionButton.trigger('click')
      expect(handlerAction).toHaveBeenCalledTimes(1)
    })
  })

  it('does not show actions in embed mode', () => {
    const { wrapper } = getWrapper({ embedModeEnabled: true })
    expect(wrapper.findAll('.oc-button').length).toBe(0)
  })
})

function getWrapper({ embedModeEnabled = false } = {}) {
  vi.mocked(useEmbedMode).mockReturnValue(
    mock<ReturnType<typeof useEmbedMode>>({ isEnabled: ref(embedModeEnabled) })
  )

  vi.mocked(useExtensionRegistry).mockImplementation(() =>
    useExtensionRegistryMock({
      requestExtensions: () =>
        [
          mock<ActionExtension>({ scopes: ['resource.quick-action'], action: collaboratorAction }),
          mock<ActionExtension>({ scopes: ['resource.quick-action'], action: quicklinkAction })
        ] as any
    })
  )

  return {
    wrapper: shallowMount(QuickActions, {
      props: {
        item: testItem
      },
      global: {
        stubs: { OcButton: false },
        mocks: { ...defaultComponentMocks() },
        plugins: [...defaultPlugins()]
      }
    })
  }
}
