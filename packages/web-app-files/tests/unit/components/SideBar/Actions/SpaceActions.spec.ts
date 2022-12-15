import SpaceActions from 'web-app-files/src/components/SideBar/Actions/SpaceActions.vue'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { mockDeep } from 'jest-mock-extended'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

const mixins = [
  '$_rename_items',
  '$_editDescription_items',
  '$_uploadImage_items',
  '$_editReadmeContent_items',
  '$_editQuota_items',
  '$_deletedFiles_items',
  '$_restore_items',
  '$_delete_items',
  '$_disable_items',
  '$_editReadmeContent_modalOpen',
  '$_editQuota_modalOpen',
  '$_editReadmeContent_closeModal',
  '$_editQuota_closeModal'
]

const selectors = {
  actionMenuItemStub: 'action-menu-item-stub',
  readmeContentModalStub: 'readme-content-modal-stub',
  quotaModalStub: 'quota-modal-stub',
  spaceImageUploadInput: '#space-image-upload-input'
}

const Component = { ...SpaceActions, mixins }

describe('SpaceActions', () => {
  it('does not render actions when no enabled actions available', async () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find(selectors.actionMenuItemStub).exists()).toBeFalsy()
  })
  it('renders enabled actions', () => {
    const enabledActions = ['$_rename_items', '$_editDescription_items']
    const { wrapper } = getWrapper({ enabledActions })
    expect(wrapper.findAll(selectors.actionMenuItemStub).length).toBe(enabledActions.length)
  })
  it('renders the readme content modal component', () => {
    const { wrapper } = getWrapper({ readmeContentModalOpen: true })
    expect(wrapper.find(selectors.readmeContentModalStub).exists()).toBeTruthy()
  })
  it('renders the quota modal component', () => {
    const { wrapper } = getWrapper({ editQuotaModalOpen: true })
    expect(wrapper.find(selectors.quotaModalStub).exists()).toBeTruthy()
  })
  describe('space image upload input', () => {
    it('calls the action event on change', async () => {
      const { wrapper } = getWrapper()
      await wrapper.find(selectors.spaceImageUploadInput).trigger('change')
      expect(wrapper.vm.$_uploadImage_uploadImageSpace).toHaveBeenCalled()
    })
  })
})

function getWrapper({
  enabledActions = [],
  readmeContentModalOpen = false,
  editQuotaModalOpen = false
} = {}) {
  const mocks = {
    ...defaultComponentMocks(),
    ...getMixinMocks(enabledActions)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => mockDeep<Resource>())
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      data: () => ({
        $_editReadmeContent_modalOpen: readmeContentModalOpen,
        $_editQuota_modalOpen: editQuotaModalOpen
      }),
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        stubs: {
          'action-menu-item': true,
          'readme-content-modal': true,
          'quota-modal': true
        },
        provide: {
          displayedSpace: mockDeep<SpaceResource>()
        }
      }
    })
  }
}

const getMixinMocks = (enabledActions) => {
  const mixinMocks = {
    $_uploadImage_uploadImageSpace: jest.fn(() => [{ isEnabled: () => false, name: '', items: [] }])
  }
  for (const mixin of mixins) {
    const isEnabled = !!enabledActions.includes(mixin)
    mixinMocks[mixin] = [{ isEnabled: () => isEnabled, name: '', items: [] }]
  }
  return mixinMocks
}
