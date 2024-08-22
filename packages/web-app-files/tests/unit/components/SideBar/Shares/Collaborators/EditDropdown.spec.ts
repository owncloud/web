import EditDropdown from 'web-app-files/src/components/SideBar/Shares/Collaborators/EditDropdown.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import OcButton from 'design-system/src/components/OcButton/OcButton.vue'

const selectors = {
  editBtn: '.collaborator-edit-dropdown-options-btn',
  removeShareAction: '.remove-share',
  expireDateMenuAction: '.files-collaborators-expiration',
  showAccessDetailsAction: '.show-access-details'
}

describe('EditDropdown', () => {
  describe('edit button', () => {
    it('is being rendered correctly', () => {
      const { wrapper } = getWrapper()
      const btn = wrapper.findComponent<typeof OcButton>(selectors.editBtn)

      expect(wrapper.find(selectors.editBtn).exists()).toBeTruthy()
      expect(btn.props('disabled')).toBeFalsy()
    })
    it('is being disabled when locked', () => {
      const { wrapper } = getWrapper({ isLocked: true })
      const btn = wrapper.findComponent<typeof OcButton>(selectors.editBtn)
      expect(btn.props('disabled')).toBeTruthy()
    })
  })
  describe('remove share action', () => {
    it('is being rendered when canEditOrDelete is true', () => {
      const { wrapper } = getWrapper({ canEditOrDelete: true })
      expect(wrapper.find(selectors.removeShareAction).exists()).toBeTruthy()
    })
    it('is not being rendered when canEditOrDelete is false', () => {
      const { wrapper } = getWrapper({ canEditOrDelete: false })
      expect(wrapper.find(selectors.removeShareAction).exists()).toBeFalsy()
    })
  })
  describe('expiration date', () => {
    it('is being rendered when canEditOrDelete is true', () => {
      const { wrapper } = getWrapper({ canEditOrDelete: true })
      expect(wrapper.find(selectors.expireDateMenuAction).exists()).toBeTruthy()
    })
    it('is not being rendered when canEditOrDelete is false', () => {
      const { wrapper } = getWrapper({ canEditOrDelete: false })
      expect(wrapper.find(selectors.expireDateMenuAction).exists()).toBeFalsy()
    })
  })
  describe('show access details action', () => {
    it('is being rendered', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.showAccessDetailsAction).exists()).toBeTruthy()
    })
  })
})

function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(EditDropdown, {
      props: {
        canEditOrDelete: true,
        shareCategory: 'user',
        ...props
      },
      global: {
        plugins: [...defaultPlugins()],
        provide: { resource: mock<Resource>() },
        stubs: { OcDrop: false, OcList: false }
      }
    })
  }
}
