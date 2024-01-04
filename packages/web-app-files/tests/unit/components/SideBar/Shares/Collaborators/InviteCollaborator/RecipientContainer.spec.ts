import RecipientContainer from 'web-app-files/src/components/SideBar/Shares/Collaborators/InviteCollaborator/RecipientContainer.vue'
import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'

jest.mock('web-app-files/src/helpers/user/avatarUrl', () => ({
  avatarUrl: jest.fn().mockReturnValue('avatarUrl')
}))

const getRecipient = (shareType: number | string = ShareTypes.user.value) => ({
  label: 'Albert Einstein',
  value: {
    shareType,
    shareWith: 'einstein',
    shareWithAdditionalInfo: 'einstein@example.org'
  }
})

describe('InviteCollaborator RecipientContainer', () => {
  describe('renders a recipient with a deselect button', () => {
    it.each(ShareTypes.authenticated)('different recipients for different shareTypes', (type) => {
      const recipient = getRecipient(type.key)
      const { wrapper } = getMountedWrapper(recipient)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  it('displays an avatar image if capability is present', async () => {
    const recipient = getRecipient()
    const { wrapper } = getMountedWrapper(recipient, true)
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('emits an event if deselect button is clicked', async () => {
    const recipient = getRecipient()
    const { wrapper } = getMountedWrapper(recipient, true)
    const spyOnDeselect = wrapper.vm.deselect.mockImplementation()
    const button = wrapper.find('.files-share-invite-recipient-btn-remove')
    await button.trigger('click')
    expect(spyOnDeselect).toHaveBeenCalledTimes(1)
  })
})

function getMountedWrapper(recipient, avatarsEnabled = false) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockImplementation(() => ({
    files_sharing: {
      user: {
        profile_picture: avatarsEnabled,
        expire_date: {
          enabled: true,
          days: 10
        }
      }
    }
  }))
  const store = createStore(storeOptions)
  return {
    wrapper: mount(RecipientContainer, {
      props: {
        recipient,
        deselect: jest.fn()
      },
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: {
          OcIcon: true
        }
      }
    })
  }
}
