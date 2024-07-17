import FileShares from 'web-app-files/src/components/SideBar/Shares/FileShares.vue'
import { mock } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { SpaceResource } from '@ownclouders/web-client'
import { v4 as uuidV4 } from 'uuid'
import { CollaboratorShare, ShareRole, ShareTypes } from '@ownclouders/web-client'
import {
  defaultPlugins,
  mount,
  shallowMount,
  defaultComponentMocks,
  defaultStubs
} from 'web-test-helpers'
import CollaboratorListItem from '../../../../../src/components/SideBar/Shares/Collaborators/ListItem.vue'
import { AncestorMetaData, CapabilityStore, useCanShare, useModals } from '@ownclouders/web-pkg'
import { User } from '@ownclouders/web-client/graph/generated'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useCanShare: vi.fn()
}))

const getCollaborator = (): CollaboratorShare => ({
  id: uuidV4(),
  sharedWith: {
    id: 'einstein',
    displayName: 'Albert Einstein'
  },
  sharedBy: {
    id: 'admin',
    displayName: 'Admin'
  },
  permissions: [],
  role: mock<ShareRole>(),
  resourceId: uuidV4(),
  indirect: false,
  shareType: ShareTypes.user.value,
  createdDateTime: '2024-01-01'
})

describe('FileShares', () => {
  describe('invite collaborator form', () => {
    it('renders the form when the resource can be shared', () => {
      const resource = mock<Resource>()
      const { wrapper } = getWrapper({ resource, canShare: true })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeTruthy()
    })
    it('does not render the form when the resource can not be shared', () => {
      const resource = mock<Resource>()
      const { wrapper } = getWrapper({ resource, canShare: false })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeFalsy()
    })
  })

  describe('collaborators list', () => {
    let collaborators: CollaboratorShare[]
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
      const { wrapper } = getWrapper({ collaborators })
      const { dispatchModal } = useModals()
      wrapper
        .findComponent<typeof CollaboratorListItem>('collaborator-list-item-stub')
        .vm.$emit('onDelete')
      await wrapper.vm.$nextTick()
      expect(dispatchModal).toHaveBeenCalledTimes(1)
    })
    it('correctly passes the shared parent route to the collaborator list item for indirect shares', () => {
      const indirectCollaborator = { ...getCollaborator(), indirect: true }
      const ancestorMetaData = {
        '/somePath': { id: indirectCollaborator.resourceId }
      } as unknown as AncestorMetaData
      const { wrapper } = getWrapper({ collaborators: [indirectCollaborator], ancestorMetaData })
      const listItemStub = wrapper.findComponent<typeof CollaboratorListItem>(
        'collaborator-list-item-stub'
      )
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
    it('share should be modifiable if its personal space share', () => {
      const space = mock<SpaceResource>({ driveType: 'personal' })
      const { wrapper } = getWrapper({ space, mountType: shallowMount, collaborators })
      expect(wrapper.vm.isShareModifiable(collaborators[0])).toBe(true)
    })
    it('share should not be modifiable if its not personal space share', () => {
      const space = mock<SpaceResource>({ driveType: 'project' })
      const { wrapper } = getWrapper({ space, mountType: shallowMount, collaborators })
      expect(wrapper.vm.isShareModifiable(collaborators[0])).toBe(false)
    })
    it('share should not be modifiable if collaborator is indirect', () => {
      const space = mock<SpaceResource>({ driveType: 'personal' })
      const { wrapper } = getWrapper({ space, mountType: shallowMount, collaborators })
      collaborators[0]['indirect'] = true
      expect(wrapper.vm.isShareModifiable(collaborators[0])).toBe(false)
    })
    it('share should not be modifiable if user is not manager', () => {
      const space = mock<SpaceResource>({ driveType: 'project', isManager: () => false })
      collaborators[0]['indirect'] = true
      const { wrapper } = getWrapper({ space, mountType: shallowMount, collaborators })
      expect(wrapper.vm.isShareModifiable(collaborators[0])).toBe(false)
    })
  })

  describe('current space', () => {
    it('loads space members if a space is given and the current user is member', () => {
      const user = { id: '1' } as User
      const space = mock<SpaceResource>({ driveType: 'project' })
      const spaceMembers = [
        { sharedWith: { id: user.id } },
        { sharedWith: { id: '2' } }
      ] as CollaboratorShare[]
      const collaborator = getCollaborator()
      collaborator.sharedWith = {
        ...collaborator.sharedWith,
        id: user.id
      }
      const { wrapper } = getWrapper({ space, collaborators: [collaborator], user, spaceMembers })
      expect(wrapper.find('#files-collaborators-list').exists()).toBeTruthy()
      expect(wrapper.findAll('#files-collaborators-list li').length).toBe(1)
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('does not load space members if a space is given but the current user not a member', () => {
      const user = { id: '1' } as User
      const space = mock<SpaceResource>({ driveType: 'project' })
      const spaceMembers = [{ sharedWith: { id: `${user}-2` } }] as CollaboratorShare[]
      const collaborator = getCollaborator()
      collaborator.sharedWith = {
        ...collaborator.sharedWith,
        id: user.id
      }
      const { wrapper } = getWrapper({ space, collaborators: [collaborator], user, spaceMembers })
      expect(wrapper.find('#space-collaborators-list').exists()).toBeFalsy()
    })
  })

  describe('"deleteShareConfirmation" method', () => {
    it('dispatches a modal', () => {
      const { wrapper } = getWrapper()
      const { dispatchModal } = useModals()
      wrapper.vm.deleteShareConfirmation(mock<CollaboratorShare>())
      expect(dispatchModal).toHaveBeenCalled()
    })
  })
})

function getWrapper({
  mountType = shallowMount,
  resource = mock<Resource>({ isReceivedShare: () => false, canShare: () => true }),
  space = mock<SpaceResource>(),
  collaborators = [],
  spaceMembers = [],
  user = undefined,
  showAllOnLoad = true,
  ancestorMetaData = {},
  canShare = true
}: {
  mountType?: typeof mount
  resource?: Resource
  space?: SpaceResource
  collaborators?: CollaboratorShare[]
  spaceMembers?: CollaboratorShare[]
  user?: User
  showAllOnLoad?: boolean
  ancestorMetaData?: AncestorMetaData
  canShare?: boolean
} = {}) {
  vi.mocked(useCanShare).mockReturnValue({ canShare: () => canShare })

  const capabilities = {
    files_sharing: { deny_access: false }
  } satisfies Partial<CapabilityStore['capabilities']>

  return {
    wrapper: mountType(FileShares, {
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              stubActions: false,
              userState: { user },
              spacesState: { spaceMembers },
              capabilityState: { capabilities },
              configState: {
                options: { contextHelpers: true, sidebar: { shares: { showAllOnLoad } } }
              },
              sharesState: { collaboratorShares: collaborators },
              resourcesStore: { ancestorMetaData }
            }
          })
        ],
        mocks: defaultComponentMocks(),
        provide: { resource, space },
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
