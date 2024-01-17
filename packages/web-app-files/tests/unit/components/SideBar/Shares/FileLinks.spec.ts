import FileLinks from 'web-app-files/src/components/SideBar/Shares/FileLinks.vue'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { Share, SharePermissions, ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import { AbilityRule } from '@ownclouders/web-client/src/helpers/resource/types'
import {
  CapabilityStore,
  FileAction,
  getDefaultLinkPermissions,
  useFileActionsCreateLink
} from '@ownclouders/web-pkg'
import { computed } from 'vue'

const defaultLinksList = [
  {
    id: '1',
    indirect: false,
    name: 'public link 1',
    url: 'some-link-1',
    path: '/file-1.txt',
    permissions: 1,
    outgoing: true,
    shareType: ShareTypes.link.value
  },
  {
    id: '2',
    indirect: true,
    name: 'public link 2',
    url: 'some-link-2',
    path: '/file-2.txt',
    permissions: 1,
    outgoing: true,
    shareType: ShareTypes.link.value
  }
]

const selectors = {
  linkAddButton: '#files-file-link-add',
  noResharePermissions: '[data-testid="files-links-no-reshare-permissions-message"]',
  linkNoResults: '#oc-file-links-no-results'
}

const linkListItemNameAndCopy = 'name-and-copy-stub'
const linkListItemDetailsAndEdit = 'details-and-edit-stub'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  getDefaultLinkPermissions: jest.fn(),
  useFileActionsCreateLink: jest.fn()
}))

describe('FileLinks', () => {
  describe('links', () => {
    describe('when links list is not empty', () => {
      it('should render a list of direct and indirect links', () => {
        const { wrapper } = getWrapper()

        const linkListItems = wrapper.findAllComponents<any>(linkListItemNameAndCopy)
        const linkListItemsDetails = wrapper.findAll(linkListItemDetailsAndEdit)

        expect(linkListItems.length).toBe(2)
        expect(linkListItemsDetails.length).toBe(2)

        expect(linkListItems.at(0).props().link).toMatchObject({
          id: '1',
          indirect: false,
          name: 'public link 1',
          key: 'direct-link-1'
        })
        expect(linkListItems.at(1).props().link).toMatchObject({
          id: '2',
          indirect: true,
          name: 'public link 2',
          key: 'indirect-link-2'
        })
      })

      it('should not show the "no results" message', () => {
        const { wrapper } = getWrapper()

        expect(wrapper.find(selectors.linkNoResults).exists()).toBeFalsy()
      })
    })

    it('should not render link list if no links are provided', () => {
      const { wrapper } = getWrapper({ links: [] })
      expect(wrapper.find('oc-list-stub').exists()).toBeFalsy()
    })
  })
  describe('when canCreateLinks is set to true', () => {
    it('should show a button to add a link', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.linkAddButton).exists()).toBeTruthy()
    })

    describe('when the add-new-link button is clicked', () => {
      it('should call createLink', async () => {
        const { wrapper, mocks } = getWrapper({ abilities: [] })
        await wrapper.find(selectors.linkAddButton).trigger('click')
        expect(mocks.createLinkMock).toHaveBeenCalledTimes(1)
      })
    })
  })
  describe('when canCreateLinks is set to false', () => {
    it('should show the "no reshare permissions" message', () => {
      const resource = mockDeep<Resource>({
        path: '/lorem.txt',
        type: 'file',
        canShare: jest.fn(() => false),
        isFolder: false,
        isReceivedShare: jest.fn()
      })
      const { wrapper } = getWrapper({ resource })
      expect(wrapper.find(selectors.noResharePermissions).exists()).toBeTruthy()
    })
  })
  describe('user does not have the permission to create public links', () => {
    const resource = mockDeep<Resource>({
      path: '/lorem.txt',
      type: 'file',
      isFolder: false,
      isReceivedShare: jest.fn(),
      canShare: () => true
    })

    it('existing viewer link is not modifiable', () => {
      const viewerLink = {
        id: '1',
        indirect: false,
        name: 'public link 1',
        url: 'some-link-1',
        path: '/file-1.txt',
        permissions: 1,
        outgoing: true,
        shareType: ShareTypes.link.value
      }
      const { wrapper } = getWrapper({ resource, abilities: [], links: [viewerLink] })
      const detailsAndEdit = wrapper.findComponent<any>(linkListItemDetailsAndEdit)
      const isModifiable = detailsAndEdit.props('isModifiable')
      expect(isModifiable).toBeFalsy()
    })
    it('existing internal link is modifiable but only shows the internal link option', () => {
      const internalLink = {
        id: '1',
        indirect: false,
        name: 'internal link 1',
        url: 'some-link-1',
        path: '/file-1.txt',
        permissions: 0,
        outgoing: true,
        shareType: ShareTypes.link.value
      }
      const { wrapper } = getWrapper({ resource, abilities: [], links: [internalLink] })
      const detailsAndEdit = wrapper.findComponent<any>(linkListItemDetailsAndEdit)
      const availableRoleOptions = detailsAndEdit.props('availableRoleOptions')
      const isModifiable = detailsAndEdit.props('isModifiable')
      expect(availableRoleOptions.length).toBe(1)
      expect(availableRoleOptions[0].permissions()).toEqual([SharePermissions.internal])
      expect(isModifiable).toBeTruthy()
    })
  })
})

function getWrapper({
  resource = mockDeep<Resource>({ isFolder: false, canShare: () => true }),
  links = defaultLinksList,
  abilities = [{ action: 'create-all', subject: 'PublicLink' }],
  defaultLinkPermissions = 0
}: {
  resource?: Resource
  links?: typeof defaultLinksList
  abilities?: AbilityRule[]
  defaultLinkPermissions?: number
} = {}) {
  const createLinkMock = jest.fn()
  jest.mocked(getDefaultLinkPermissions).mockReturnValue(defaultLinkPermissions)
  jest.mocked(useFileActionsCreateLink).mockReturnValue({
    actions: computed(() => [mock<FileAction>({ name: 'create-links', handler: createLinkMock })])
  })

  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks()
  const capabilities = {
    files_sharing: {
      public: {
        expire_date: {},
        alias: true,
        password: {
          enforced_for: { read_only: false, upload_only: false, read_write: false }
        }
      }
    }
  } satisfies Partial<CapabilityStore['capabilities']>

  return {
    mocks: { ...mocks, createLinkMock },
    storeOptions,
    wrapper: shallowMount(FileLinks, {
      global: {
        plugins: [
          ...defaultPlugins({
            abilities,
            piniaOptions: {
              capabilityState: { capabilities },
              configState: { options: { sidebar: { shares: { showAllOnLoad: true } } } },
              sharesState: { shares: links as Share[] }
            }
          }),
          store
        ],
        renderStubDefaultSlot: true,
        stubs: { OcButton: false },
        mocks,
        provide: {
          incomingParentShare: undefined,
          resource
        }
      }
    })
  }
}
