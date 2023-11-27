import { useEmbedMode } from '@ownclouders/web-pkg'
import QuickActions from '../../../../src/components/FilesList/QuickActions.vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { ref } from 'vue'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useEmbedMode: jest.fn()
}))

const collaboratorAction = {
  displayed: jest.fn(() => true),
  handler: jest.fn(),
  icon: 'group-add',
  id: 'collaborators',
  label: () => 'Add people'
}

const quicklinkAction = {
  displayed: jest.fn(() => false),
  handler: jest.fn(),
  icon: 'link-add',
  id: 'quicklink',
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
      expect(actionButton.attributes().class).toContain('files-quick-action-collaborators')
      expect(iconEl.exists()).toBeTruthy()
      expect(iconEl.attributes().name).toBe('group-add')
      expect(actionButton.attributes('aria-label')).toBe('Add people')
    })

    it('should not display action buttons where "displayed" is set to false', () => {
      const linkActionButton = wrapper.find('.files-quick-action-public-link')

      expect(linkActionButton.exists()).toBeFalsy()
    })
  })

  describe('action handler', () => {
    it('should call action handler on click', async () => {
      const { wrapper } = getWrapper()
      const handlerAction = collaboratorAction.handler.mockImplementation()

      const actionButton = wrapper.find('.oc-button')
      await actionButton.trigger('click')
      expect(handlerAction).toHaveBeenCalledTimes(1)
      Object.keys(testItem).forEach((key) => {
        expect(handlerAction.mock.calls[0][0].item[key]).toBe(testItem[key])
      })
    })
  })

  it('does not show actions in embed mode', () => {
    const { wrapper } = getWrapper({ embedModeEnabled: true })
    expect(wrapper.findAll('.oc-button').length).toBe(0)
  })
})

function getWrapper({ embedModeEnabled = false } = {}) {
  jest
    .mocked(useEmbedMode)
    .mockReturnValue(mock<ReturnType<typeof useEmbedMode>>({ isEnabled: ref(embedModeEnabled) }))

  return {
    wrapper: shallowMount(QuickActions, {
      props: {
        actions: {
          collaborators: collaboratorAction,
          publicLink: quicklinkAction
        },
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
