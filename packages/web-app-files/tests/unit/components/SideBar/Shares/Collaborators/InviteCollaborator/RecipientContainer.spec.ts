import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import RecipientContainer from 'web-app-files/src/components/SideBar/Shares/Collaborators/InviteCollaborator/RecipientContainer.vue'
import { ShareTypes } from 'web-client/src/helpers/share'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'

jest.mock('web-app-files/src/helpers/user/avatarUrl', () => ({
  avatarUrl: jest.fn().mockReturnValue('avatarUrl')
}))

const localVue = defaultLocalVue()

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
      const wrapper = getMountedWrapper(recipient)
      expect(wrapper).toMatchSnapshot()
    })
  })
  it('displays an avatar image if capability is present', () => {
    const recipient = getRecipient()
    const wrapper = getMountedWrapper(recipient, true)
    expect(wrapper).toMatchSnapshot()
  })
  it('emits an event if deselect button is clicked', async () => {
    const recipient = getRecipient()
    const wrapper = getMountedWrapper(recipient, true)
    const spyOnDeselect = wrapper.vm.deselect.mockImplementation()
    const button = wrapper.find('.files-share-invite-recipient-btn-remove')
    await button.trigger('click')
    expect(spyOnDeselect).toHaveBeenCalledTimes(1)
  })
})

const storeOptions = (avatarsEnabled) => {
  return {
    getters: {
      user: () => ({ id: 1 }),
      capabilities: () => {
        return {
          files_sharing: {
            user: {
              profile_picture: avatarsEnabled,
              expire_date: {
                enabled: true,
                days: 10
              }
            }
          }
        }
      }
    }
  }
}

function getMountedWrapper(recipient, avatarsEnabled = false) {
  return mount(RecipientContainer, {
    localVue,
    propsData: {
      recipient,
      deselect: jest.fn()
    },
    store: createStore(avatarsEnabled),
    stubs: {
      OcIcon: true
    },
    computed: {
      configuration: () => ({})
    }
  })
}

function createStore(avatarsEnabled) {
  return new Vuex.Store(storeOptions(avatarsEnabled))
}
