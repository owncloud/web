import { mock } from 'vitest-mock-extended'
import InviteCollaboratorForm from 'web-app-files/src/components/SideBar/Shares/Collaborators/InviteCollaborator/InviteCollaboratorForm.vue'
import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import {
  defaultComponentMocks,
  defaultPlugins,
  RouteLocation,
  shallowMount
} from 'web-test-helpers'
import { Resource, SpaceResource } from '@ownclouders/web-client'

const folderMock = {
  type: 'folder',
  isFolder: true,
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  isMounted: vi.fn(() => true),
  name: 'lorem.txt',
  privateLink: 'some-link',
  canShare: vi.fn(() => true),
  path: '/documents',
  canDeny: () => false
}

const spaceMock = {
  id: '1',
  type: 'space'
}

describe('InviteCollaboratorForm', () => {
  describe('renders correctly', () => {
    it.todo('renders a select field for share receivers')
    it.todo('renders an inviteDescriptionMessage')
    it.todo('renders a role selector component')
    it.todo('renders an expiration datepicker component')
    it.todo('renders an invite-sharees button')
    it.todo('renders an hidden-announcer')
  })
  describe('behaves correctly', () => {
    it.todo('upon mount fetches recipients')
    it('clicking the invite-sharees button calls the "share"-action', async () => {
      const selectedCollaborators = [
        { shareWith: 'marie', value: { shareType: ShareTypes.user.value }, label: 'label' }
      ]
      const { wrapper } = getWrapper({ selectedCollaborators })
      const spyTriggerUpload = vi.spyOn(wrapper.vm, 'share')
      const shareBtn = wrapper.find('#new-collaborators-form-create-button')
      expect(shareBtn.exists()).toBeTruthy()

      await shareBtn.trigger('click')
      expect(spyTriggerUpload).toHaveBeenCalledTimes(0)
    })
    it.each([
      { storageId: undefined, resource: mock<Resource>(folderMock), addMethod: 'addShare' },
      {
        storageId: undefined,
        resource: mock<SpaceResource>(spaceMock),
        addMethod: 'addSpaceMember'
      },
      { storageId: '1', resource: mock<Resource>(folderMock), addMethod: 'addShare' }
    ] as const)('calls the "addShare" action', async (dataSet) => {
      const selectedCollaborators = [
        { shareWith: 'marie', value: { shareType: ShareTypes.user.value }, label: 'label' }
      ]
      const { wrapper } = getWrapper({
        selectedCollaborators,
        storageId: dataSet.storageId,
        resource: dataSet.resource
      })
      const addShareSpy = vi.spyOn(wrapper.vm, dataSet.addMethod)
      await wrapper.vm.share()
      expect(addShareSpy).toHaveBeenCalled()
    })
    it.todo('resets focus upon selecting an invitee')
  })
})

function getWrapper({
  selectedCollaborators = [],
  storageId = 'fake-storage-id',
  resource = mock<Resource>(folderMock)
}: {
  selectedCollaborators?: any[]
  storageId?: string
  resource?: Resource
} = {}) {
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ params: { storageId } })
  })
  const capabilities = { files_sharing: { federation: { incoming: true, outgoing: true } } }

  return {
    wrapper: shallowMount(InviteCollaboratorForm, {
      data() {
        return {
          selectedCollaborators
        }
      },
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              capabilityState: { capabilities },
              configState: { options: { concurrentRequests: { shares: { create: 1 } } } }
            }
          })
        ],
        provide: { ...mocks, resource },
        mocks
      }
    })
  }
}
