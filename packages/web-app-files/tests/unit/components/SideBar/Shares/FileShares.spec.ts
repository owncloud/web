import FileShares from 'web-app-files/src/components/SideBar/Shares/FileShares.vue'
import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { SpaceResource } from '@ownclouders/web-client/src/helpers'
import { v4 as uuidV4 } from 'uuid'
import { Share } from '@ownclouders/web-client/src/helpers/share'
import {
  createStore,
  defaultPlugins,
  mount,
  shallowMount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs,
  RouteLocation
} from 'web-test-helpers'

const getCollaborator = () => ({
  shareType: 0,
  id: uuidV4(),
  collaborator: {
    name: 'einstein',
    displayName: 'Albert Einstein',
    additionalInfo: 'einstein@example.org'
  },
  owner: {
    name: 'admin',
    displayName: 'Admin',
    additionalInfo: 'admin@example.org'
  },
  fileOwner: {
    name: 'admin',
    displayName: 'Admin',
    additionalInfo: 'admin@example.org'
  },
  file: {},
  stime: '1639152810',
  permissions: 15,
  itemSource: '1',
  path: "/Neuer Ordner-'singe'",
  key: 'collaborator-f5c28709-b921-4ec8-b39a-4c243709b514'
})

describe('FileShares', () => {
  describe('invite collaborator form', () => {
    it('renders the form when the resource can be shared', () => {
      const resource = mock<Resource>({ isReceivedShare: () => false, canShare: () => true })
      const { wrapper } = getWrapper({ resource })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeTruthy()
    })
    it('does not render the form when the resource can not be shared', () => {
      const resource = mock<Resource>({ isReceivedShare: () => false, canShare: () => false })
      const { wrapper } = getWrapper({ resource })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeFalsy()
    })
    it('does render the form when the resource is a received share and re-sharing is enabled', () => {
      const resource = mock<Resource>({ isReceivedShare: () => true, canShare: () => true })
      const { wrapper } = getWrapper({ resource })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeTruthy()
    })
    it('does not render the form when the resource is a received share and re-sharing is disabled', () => {
      const resource = mock<Resource>({ isReceivedShare: () => true, canShare: () => true })
      const { wrapper } = getWrapper({ resource, hasReSharing: false })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeFalsy()
    })
  })

  describe('collaborators list', () => {
    let collaborators
    beforeEach(() => {
      collaborators = [getCollaborator(), getCollaborator(), getCollaborator(), getCollaborator()]
    })

    it('renders sharedWithLabel and sharee list', () => {
      const { wrapper } = getWrapper({ collaborators })
      expect(wrapper.find('#files-collaborators-list').exists()).toBeTruthy()
      expect(wrapper.findAll('#files-collaborators-list li').length).toBe(collaborators.length)
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('reacts on delete events', async () => {
      const spyOnCollaboratorDeleteTrigger = jest
        .spyOn((FileShares as any).methods, '$_ocCollaborators_deleteShare_trigger')
        .mockImplementation()
      const { wrapper } = getWrapper({ collaborators })
      ;(wrapper.findComponent<any>('collaborator-list-item-stub').vm as any).$emit('onDelete')
      await wrapper.vm.$nextTick()
      expect(spyOnCollaboratorDeleteTrigger).toHaveBeenCalledTimes(1)
    })
    it('correctly passes the shared parent route to the collaborator list item for indirect shares', () => {
      const indirectCollaborator = { ...getCollaborator(), indirect: true }
      const ancestorMetaData = {
        '/somePath': { id: indirectCollaborator.itemSource }
      }
      const { wrapper } = getWrapper({ collaborators: [indirectCollaborator], ancestorMetaData })
      const listItemStub = wrapper.findComponent<any>('collaborator-list-item-stub')
      expect(listItemStub.props('sharedParentRoute')).toBeTruthy()
      expect(listItemStub.props('modifiable')).toBeFalsy()
    })
    it('toggles the share list', async () => {
      const showAllOnLoad = true
      const { wrapper } = getWrapper({ mountType: mount, collaborators })
      expect(wrapper.vm.sharesListCollapsed).toBe(!showAllOnLoad)
      await wrapper.find('.toggle-shares-list-btn').trigger('click')
      expect(wrapper.vm.sharesListCollapsed).toBe(showAllOnLoad)
    })
    it('share should be modifiable if its personal space share', async () => {
      const space = mock<SpaceResource>({ driveType: 'personal' })
      const { wrapper } = getWrapper({ space, mountType: shallowMount, collaborators })
      expect(wrapper.vm.isShareModifiable(collaborators[0])).toBe(true)
    })
    it('share should not be modifiable if its not personal space share', async () => {
      const space = mock<SpaceResource>({ driveType: 'project' })
      const { wrapper } = getWrapper({ space, mountType: shallowMount, collaborators })
      expect(wrapper.vm.isShareModifiable(collaborators[0])).toBe(false)
    })
    it('share should not be modifiable if collaborator is indirect', async () => {
      const space = mock<SpaceResource>({ driveType: 'personal' })
      const { wrapper } = getWrapper({ space, mountType: shallowMount, collaborators })
      collaborators[0]['indirect'] = true
      expect(wrapper.vm.isShareModifiable(collaborators[0])).toBe(false)
    })
    it('share should not be modifiable if user is not manager', async () => {
      const space = mock<SpaceResource>({ driveType: 'personal' })
      ;(space as any).isManager = jest.fn(() => false)
      collaborators[0]['indirect'] = true
      const { wrapper } = getWrapper({ space, mountType: shallowMount, collaborators })
      expect(wrapper.vm.isShareModifiable(collaborators[0])).toBe(false)
    })
  })

  describe('current space', () => {
    it('loads space members if a space is given and the current user is member', () => {
      const user = { id: '1' }
      const space = mock<SpaceResource>({ driveType: 'project', isMember: () => true })
      const spaceMembers = [{ collaborator: { name: user.id } }, { collaborator: { name: 2 } }]
      const collaborator = getCollaborator()
      collaborator.collaborator = { ...collaborator.collaborator, name: user.id }
      const { wrapper } = getWrapper({ space, collaborators: [collaborator], user, spaceMembers })
      expect(wrapper.find('#files-collaborators-list').exists()).toBeTruthy()
      expect(wrapper.findAll('#files-collaborators-list li').length).toBe(1)
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('does not load space members if a space is given but the current user not a member', () => {
      const user = { id: '1' }
      const space = mock<SpaceResource>({ driveType: 'project' })
      const spaceMembers = [{ collaborator: { name: `${user}-2` } }]
      const collaborator = getCollaborator()
      collaborator.collaborator = { ...collaborator.collaborator, name: user.id }
      const { wrapper } = getWrapper({ space, collaborators: [collaborator], user, spaceMembers })
      expect(wrapper.find('#space-collaborators-list').exists()).toBeFalsy()
    })
  })

  describe('"$_ocCollaborators_deleteShare" method', () => {
    it('calls "deleteShare" when successful', async () => {
      const { wrapper } = getWrapper()
      const deleteShareSpy = jest.spyOn(wrapper.vm, 'deleteShare')
      const share = mock<Share>()
      await wrapper.vm.$_ocCollaborators_deleteShare(share)
      expect(deleteShareSpy).toHaveBeenCalled()
    })
    it('shows a message when an error occurs', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper()
      jest.spyOn(wrapper.vm, 'deleteShare').mockRejectedValue(new Error())
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage')
      const share = mock<Share>()
      await wrapper.vm.$_ocCollaborators_deleteShare(share)
      expect(showErrorMessageSpy).toHaveBeenCalled()
    })
    it('removes file when the last share on the "Shared with others"-page has been removed', async () => {
      const { wrapper } = getWrapper({
        collaborators: [getCollaborator()],
        currentRouteName: 'files-shares-with-others'
      })
      const deleteShareSpy = jest.spyOn(wrapper.vm, 'deleteShare')
      const removeFilesSpy = jest.spyOn(wrapper.vm, 'REMOVE_FILES')
      const share = mock<Share>()
      await wrapper.vm.$_ocCollaborators_deleteShare(share)
      expect(deleteShareSpy).toHaveBeenCalled()
      expect(removeFilesSpy).toHaveBeenCalled()
    })
  })
})

function getWrapper({
  mountType = shallowMount,
  resource = mock<Resource>({ isReceivedShare: () => false, canShare: () => true }),
  hasReSharing = true,
  space = mock<SpaceResource>(),
  collaborators = [],
  spaceMembers = [],
  user = { id: '1' },
  showAllOnLoad = true,
  currentRouteName = 'files-spaces-generic',
  ancestorMetaData = {}
} = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    state: { user },
    getters: {
      ...defaultStoreMockOptions.getters,
      user: () => user,
      capabilities: jest.fn(() => ({
        files_sharing: { resharing: hasReSharing }
      })),
      configuration: jest.fn(() => ({
        options: { contextHelpers: true, sidebar: { shares: { showAllOnLoad } } }
      }))
    }
  }
  storeOptions.modules.runtime.modules.ancestorMetaData.getters.ancestorMetaData.mockReturnValue(
    ancestorMetaData
  )
  storeOptions.modules.runtime.modules.spaces.getters.spaceMembers.mockImplementation(
    () => spaceMembers
  )
  storeOptions.modules.Files.getters.outgoingCollaborators.mockReturnValue(collaborators)
  const store = createStore(storeOptions)
  return {
    wrapper: mountType(FileShares, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultComponentMocks({
          currentRoute: mock<RouteLocation>({ name: currentRouteName })
        }),
        provide: {
          resource,
          space,
          incomingParentShare: {}
        },
        stubs: {
          ...defaultStubs,
          OcButton: false,
          'invite-collaborator-form': true,
          'collaborator-list-item': true
        }
      }
    })
  }
}
