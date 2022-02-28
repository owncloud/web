import { createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import QuickActions from '../../../../src/components/FilesList/QuickActions.vue'
const { shallowMount, mount } = require('@vue/test-utils')

const collaboratorAction = {
  displayed: jest.fn(() => true),
  handler: jest.fn(),
  icon: 'group-add',
  id: 'collaborators',
  label: () => 'Add people'
}

const publicLinkAction = {
  displayed: jest.fn(() => false),
  handler: jest.fn(),
  icon: 'link-add',
  id: 'public-link',
  label: () => 'Create and copy public link'
}

const testItem = {
  icon: 'file',
  name: 'lorem.txt',
  path: '/lorem.txt',
  size: '12220'
}

describe('QuickActions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when multiple actions are provided', () => {
    const wrapper = getShallowMountedWrapper()

    it('should display all action buttons where "displayed" is set to true', () => {
      const actionButtons = wrapper.findAll('oc-button-stub')
      // there are two items provided as actions, with only one item set to display
      expect(actionButtons.length).toBe(1)

      const actionButton = actionButtons.at(0)
      const iconEl = actionButton.find('oc-icon-stub')

      expect(actionButton.exists()).toBeTruthy()
      expect(actionButton.attributes().class).toContain('files-quick-action-collaborators')
      expect(iconEl.exists()).toBeTruthy()
      expect(iconEl.attributes().name).toBe('group-add')
      expect(actionButton.attributes('arialabel')).toBe('Add people')
    })

    it('should not display action buttons where "displayed" is set to false', () => {
      const linkActionButton = wrapper.find('.files-quick-action-public-link')

      expect(linkActionButton.exists()).toBeFalsy()
    })
  })

  describe('action handler', () => {
    it('should call action handler on click', async () => {
      const wrapper = getMountedWrapper()
      const handlerAction = jest.spyOn(collaboratorAction, 'handler').mockImplementation()

      const actionButton = wrapper.find('button')
      await actionButton.trigger('click')
      expect(handlerAction).toHaveBeenCalledTimes(1)
      Object.keys(testItem).forEach((key) => {
        expect(handlerAction.mock.calls[0][0].item[key]).toBe(testItem[key])
      })
    })
  })
})

function getShallowMountedWrapper() {
  const localVue = createLocalVue()
  localVue.use(DesignSystem)
  return shallowMount(QuickActions, {
    localVue,
    propsData: {
      actions: {
        collaborators: collaboratorAction,
        publicLink: publicLinkAction
      },
      item: testItem
    },
    directives: {
      'oc-tooltip': jest.fn()
    },
    stubs: {
      'oc-icon': true,
      'oc-button': true
    }
  })
}

function getMountedWrapper() {
  const localVue = createLocalVue()
  localVue.use(DesignSystem)
  return mount(QuickActions, {
    localVue,
    propsData: {
      actions: {
        collaborators: collaboratorAction,
        publicLink: publicLinkAction
      },
      item: testItem
    },
    directives: {
      'oc-tooltip': jest.fn()
    },
    stubs: {
      'oc-icon': false,
      'oc-button': false
    }
  })
}
