import SpaceMembers from 'web-app-files/src/components/SideBar/Shares/SpaceMembers.vue'
import { mount, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import {
  spaceRoleManager,
  spaceRoleViewer,
  ShareTypes,
  spaceRoleEditor
} from 'web-client/src/helpers/share'
import { mockDeep } from 'jest-mock-extended'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { SpaceResource, User } from 'web-client/src/helpers'

const localVue = defaultLocalVue()

const memberMocks = {
  [spaceRoleManager.name]: {
    id: '1',
    shareType: ShareTypes.space.value,
    collaborator: {
      name: 'alice',
      displayName: 'alice'
    },
    role: {
      name: spaceRoleManager.name
    }
  },
  [spaceRoleEditor.name]: {
    id: '2',
    shareType: ShareTypes.space.value,
    collaborator: {
      onPremisesSamAccountName: 'Einstein',
      displayName: 'einstein'
    },
    role: {
      name: spaceRoleEditor.name
    }
  },
  [spaceRoleViewer.name]: {
    id: '3',
    shareType: ShareTypes.space.value,
    collaborator: {
      onPremisesSamAccountName: 'Marie',
      displayName: 'marie'
    },
    role: {
      name: spaceRoleViewer.name
    }
  }
}

describe('SpaceMembers', () => {
  describe('invite collaborator form', () => {
    it('renders the form when the current user is a manager of the space', () => {
      const user = mockDeep<User>({ id: memberMocks.manager.collaborator.name })
      const wrapper = getShallowMountedWrapper({ user })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    })
    it.each([spaceRoleViewer.name, spaceRoleEditor.name])(
      'does not render the form when the current user is no manager of the space',
      (role) => {
        const user = mockDeep<User>({ id: memberMocks[role].collaborator.name })
        const wrapper = getShallowMountedWrapper({ user })
        expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeFalsy()
      }
    )
  })

  describe('existing members', () => {
    it('can edit when current user is manager of the space', () => {
      const user = mockDeep<User>({ id: memberMocks.manager.collaborator.name })
      const wrapper = getShallowMountedWrapper({ user })
      expect(wrapper.findAll('collaborator-list-item-stub').at(1).props().modifiable).toEqual(true)
      expect(wrapper).toMatchSnapshot()
    })
    it.each([spaceRoleViewer.name, spaceRoleEditor.name])(
      'can not edit when current user is not a manager of the space',
      (role) => {
        const user = mockDeep<User>({ id: memberMocks[role].collaborator.name })
        const wrapper = getShallowMountedWrapper({ user })
        expect(wrapper.findAll('collaborator-list-item-stub').at(1).props().modifiable).toEqual(
          false
        )
      }
    )
  })

  describe('delete member', () => {
    it('reacts on delete events by collaborator list items', async () => {
      const spyOnCollaboratorDeleteTrigger = jest.spyOn(
        (SpaceMembers as any).methods,
        '$_ocCollaborators_deleteShare_trigger'
      )

      const user = mockDeep<User>({ id: memberMocks.manager.collaborator.name })
      const wrapper = getShallowMountedWrapper({ user })
      wrapper.find('collaborator-list-item-stub').vm.$emit('onDelete')
      await wrapper.vm.$nextTick()
      expect(spyOnCollaboratorDeleteTrigger).toHaveBeenCalledTimes(1)
    })
  })

  describe('filter', () => {
    it('toggles the filter on click', async () => {
      const user = mockDeep<User>({ id: memberMocks.manager.collaborator.name })
      const wrapper = getShallowMountedWrapper({ mountType: mount, user })
      expect(wrapper.vm.isFilterOpen).toBeFalsy()
      await wrapper.find('.open-filter-btn').trigger('click')
      expect(wrapper.vm.isFilterOpen).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    })
  })
})

function getShallowMountedWrapper({
  mountType = shallowMount,
  space = mockDeep<SpaceResource>(),
  spaceMembers = [memberMocks.manager, memberMocks.editor, memberMocks.viewer],
  user = mockDeep<User>()
} = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    state: { user },
    getters: {
      ...defaultStoreMockOptions.getters,
      user: () => user,
      configuration: jest.fn(() => ({
        options: { sidebar: { shares: { showAllOnLoad: true } } }
      }))
    }
  }
  storeOptions.modules.runtime.modules.spaces.getters.spaceMembers.mockImplementation(
    () => spaceMembers
  )
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => space)
  const store = new Vuex.Store(storeOptions)
  return mountType(SpaceMembers, {
    localVue,
    store,
    stubs: {
      'oc-button': false,
      'oc-icon': true,
      'oc-spinner': true,
      'avatar-image': true,
      'role-dropdown': true,
      'edit-dropdown': true,
      'invite-collaborator-form': true,
      'collaborator-list-item': true
    },
    provide: {
      displayedItem: {
        value: space
      }
    }
  })
}
