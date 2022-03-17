import { createLocalVue, mount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

import Users from '@/__fixtures__/users'
import Collaborators from '@/__fixtures__/collaborators'
import SharedFiles from '@/__fixtures__/sharedFiles'

import RecipientContainer from '@files/src/components/SideBar/Shares/InviteCollaborator/RecipientContainer.vue'
import { ShareTypes } from '@files/src/helpers/share/type'
import { buildSharedResource } from '@files/src/helpers/resources'

jest.mock('@files/src/helpers/user/avatarUrl', () => ({
  avatarUrl: jest.fn().mockReturnValue('avatarUrl')
}))

const user = Users.admin
const collaborators = Collaborators

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

describe('InviteCollaborator RecipientContainer', () => {
  describe('renders a recipient with a deselect button', () => {
    it.each(ShareTypes.authenticated)('different recipients for different shareTypes', (type) => {
      const { collaborator } = collaborators.filter((sharee) => sharee.shareType === type.value)[0]
      const recipient = {
        label: collaborator.displayName,
        value: {
          shareType: type.key,
          shareWith: collaborator.name,
          shareWithAdditionalInfo: collaborator.additionalInfo
        }
      }
      const wrapper = getMountedWrapper(recipient)
      expect(wrapper).toMatchSnapshot()
    })
  })
  it('displays an avatar image if capability is present', () => {
    const { collaborator } = collaborators[0]
    const recipient = {
      label: collaborator.displayName,
      value: {
        shareType: ShareTypes.user.value,
        shareWith: collaborator.name,
        shareWithAdditionalInfo: collaborator.additionalInfo
      }
    }
    const wrapper = getMountedWrapper(recipient, true)
    expect(wrapper).toMatchSnapshot()
  })
  it('emits an event if deselect button is clicked', async () => {
    const { collaborator } = collaborators[0]
    const recipient = {
      label: collaborator.displayName,
      value: {
        shareType: ShareTypes.user.value,
        shareWith: collaborator.name,
        shareWithAdditionalInfo: collaborator.additionalInfo
      }
    }
    const wrapper = getMountedWrapper(recipient, true)
    const spyOnDeselect = jest.spyOn(wrapper.vm, 'deselect').mockImplementation()
    const button = wrapper.find('.files-share-invite-recipient-btn-remove')
    await button.trigger('click')
    expect(spyOnDeselect).toHaveBeenCalledTimes(1)
  })
})

const storeOptions = (avatarsEnabled) => {
  return {
    state: {
      user
    },
    modules: {
      Files: {
        namespaced: true,
        getters: {
          highlightedFile: () => buildSharedResource(SharedFiles.json().ocs.data[0], true)
        }
      }
    },
    getters: {
      user: () => user,
      getToken: () => '',
      capabilities: () => {
        return {
          files_sharing: {
            user: {
              profile_picture: avatarsEnabled,
              expire_date: {
                enabled: true,
                days: 10
              }
            },
            group: {
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
