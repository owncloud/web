import SpaceMembers from 'web-app-files/src/components/SideBar/Shares/SpaceMembers.vue'
import {
  spaceRoleManager,
  spaceRoleViewer,
  ShareTypes,
  spaceRoleEditor,
  Share
} from '@ownclouders/web-client/src/helpers/share'
import { mock } from 'jest-mock-extended'
import { ProjectSpaceResource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import {
  createStore,
  defaultPlugins,
  mount,
  shallowMount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  RouteLocation
} from 'web-test-helpers'
import { User } from '@ownclouders/web-client/src/generated'

const memberMocks = {
  [spaceRoleManager.name]: {
    id: '1',
    shareType: ShareTypes.spaceUser.value,
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
    shareType: ShareTypes.spaceUser.value,
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
    shareType: ShareTypes.spaceUser.value,
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
    it('renders the form when the current user is a manager of an enabled space', () => {
      const space = mock<ProjectSpaceResource>({ isManager: () => true, disabled: false })
      const wrapper = getWrapper({ space })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeTruthy()
    })
    it('does not render the form when the current user is no manager of an enabled space', () => {
      const space = mock<ProjectSpaceResource>({ isManager: () => false, disabled: false })
      const wrapper = getWrapper({ space })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeFalsy()
    })
    it('does not render the form when the current user is a manager of a disabled space', () => {
      const space = mock<ProjectSpaceResource>({ isManager: () => true, disabled: true })
      const wrapper = getWrapper({ space })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeFalsy()
    })
  })

  describe('existing members', () => {
    it('can edit when current user is manager of an enabled space', () => {
      const space = mock<ProjectSpaceResource>({ isManager: () => true, disabled: false })
      const wrapper = getWrapper({ space })
      expect(
        wrapper.findAllComponents<any>('collaborator-list-item-stub').at(1).props().modifiable
      ).toEqual(true)
    })
    it('can not edit when current user is not a manager of an enabled space', () => {
      const space = mock<ProjectSpaceResource>({ isManager: () => false, disabled: false })
      const wrapper = getWrapper({ space })
      expect(
        wrapper.findAllComponents<any>('collaborator-list-item-stub').at(1).props().modifiable
      ).toEqual(false)
    })
    it('can not edit when current user is manager of a disabled space', () => {
      const space = mock<ProjectSpaceResource>({ isManager: () => true, disabled: true })
      const wrapper = getWrapper({ space })
      expect(
        wrapper.findAllComponents<any>('collaborator-list-item-stub').at(1).props().modifiable
      ).toEqual(false)
    })
  })

  describe('deleting members', () => {
    it('reacts on delete events by collaborator list items', async () => {
      const spyOnCollaboratorDeleteTrigger = jest.spyOn(
        (SpaceMembers as any).methods,
        '$_ocCollaborators_deleteShare_trigger'
      )

      const user = mock<User>({ id: memberMocks.manager.collaborator.name })
      const wrapper = getWrapper({ user })
      ;(wrapper.findComponent<any>('collaborator-list-item-stub').vm as any).$emit('onDelete')
      await wrapper.vm.$nextTick()
      expect(spyOnCollaboratorDeleteTrigger).toHaveBeenCalledTimes(1)
    })
    it('calls "deleteSpaceMember" when successful', async () => {
      const wrapper = getWrapper()
      const deleteSpaceMemberSpy = jest.spyOn(wrapper.vm, 'deleteSpaceMember')
      const share = mock<Share>()
      await wrapper.vm.$_ocCollaborators_deleteShare(share)
      expect(deleteSpaceMemberSpy).toHaveBeenCalled()
    })
    it('shows a message when an error occurs', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const wrapper = getWrapper()
      jest.spyOn(wrapper.vm, 'deleteSpaceMember').mockRejectedValue(new Error())
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage')
      const share = mock<Share>()
      await wrapper.vm.$_ocCollaborators_deleteShare(share)
      expect(showErrorMessageSpy).toHaveBeenCalled()
    })
    it('redirects to the "files-spaces-projects"-page when the current user has been removed', async () => {
      const user = mock<User>({ onPremisesSamAccountName: memberMocks.manager.collaborator.name })
      const wrapper = getWrapper({ user })
      jest.spyOn(wrapper.vm, 'deleteSpaceMember')
      await wrapper.vm.$_ocCollaborators_deleteShare(memberMocks.manager)
      expect(wrapper.vm.$router.push).toHaveBeenCalled()
    })
    it('refreshes the page when the current user has been removed on the "files-spaces-projects"-page', async () => {
      const user = mock<User>({ onPremisesSamAccountName: memberMocks.manager.collaborator.name })
      const wrapper = getWrapper({ user, currentRouteName: 'files-spaces-projects' })
      jest.spyOn(wrapper.vm, 'deleteSpaceMember')
      await wrapper.vm.$_ocCollaborators_deleteShare(memberMocks.manager)
      expect(wrapper.vm.$router.go).toHaveBeenCalled()
    })
  })

  describe('filter', () => {
    it('toggles the filter on click', async () => {
      const space = mock<ProjectSpaceResource>({ isManager: () => true })
      const wrapper = getWrapper({ mountType: mount, space })
      expect(wrapper.vm.isFilterOpen).toBeFalsy()
      await wrapper.find('.open-filter-btn').trigger('click')
      expect(wrapper.vm.isFilterOpen).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper({
  mountType = shallowMount,
  space = mock<SpaceResource>(),
  spaceMembers = [memberMocks.manager, memberMocks.editor, memberMocks.viewer],
  user = mock<User>(),
  currentRouteName = 'files-spaces-generic'
} = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      configuration: jest.fn(() => ({
        options: { contextHelpers: true, sidebar: { shares: { showAllOnLoad: true } } }
      }))
    }
  }

  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: currentRouteName })
  })
  return mountType(SpaceMembers, {
    global: {
      plugins: [
        ...defaultPlugins({
          piniaOptions: { userState: { user }, spacesState: { spaceMembers: spaceMembers as any } }
        }),
        store
      ],
      mocks,
      provide: {
        ...mocks,
        space,
        resource: space
      },
      stubs: {
        OcButton: false,
        'oc-icon': true,
        'oc-spinner': true,
        'avatar-image': true,
        'role-dropdown': true,
        'edit-dropdown': true,
        'invite-collaborator-form': true,
        'collaborator-list-item': true
      }
    }
  })
}
