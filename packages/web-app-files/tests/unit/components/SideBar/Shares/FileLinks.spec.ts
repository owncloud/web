import FileLinks from 'web-app-files/src/components/SideBar/Shares/FileLinks.vue'
import { defaultPlugins, shallowMount, defaultComponentMocks } from 'web-test-helpers'
import { mock, mockDeep } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { LinkShare, ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import { AbilityRule } from '@ownclouders/web-client/src/helpers/resource/types'
import {
  CapabilityStore,
  FileAction,
  useCanShare,
  useFileActionsCreateLink
} from '@ownclouders/web-pkg'
import { computed } from 'vue'
import DetailsAndEdit from '../../../../../src/components/SideBar/Shares/Links/DetailsAndEdit.vue'
import { SharingLinkType } from '@ownclouders/web-client/src/generated'

const defaultLinksList = [
  {
    id: '1',
    indirect: false,
    shareType: ShareTypes.link.value,
    displayName: 'public link 1',
    webUrl: ' some-link-1'
  },
  {
    id: '2',
    indirect: true,
    shareType: ShareTypes.link.value,
    displayName: 'public link 2',
    webUrl: ' some-link-2'
  }
] as LinkShare[]

const selectors = {
  linkAddButton: '#files-file-link-add',
  noSharePermissions: '[data-testid="files-links-no-share-permissions-message"]',
  linkNoResults: '#oc-file-links-no-results',
  indirectToggle: '.indirect-link-list-toggle'
}

const linkListItemNameAndCopy = 'name-and-copy-stub'
const linkListItemDetailsAndEdit = 'details-and-edit-stub'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useFileActionsCreateLink: vi.fn(),
  useCanShare: vi.fn()
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

        expect(linkListItems.at(0).props('linkShare')).toMatchObject(defaultLinksList[0])
        expect(linkListItems.at(1).props('linkShare')).toMatchObject(defaultLinksList[1])
      })

      it('should not show the "no results" message', () => {
        const { wrapper } = getWrapper()

        expect(wrapper.find(selectors.linkNoResults).exists()).toBeFalsy()
      })

      describe('collapsing', () => {
        const link = mock<LinkShare>({ indirect: false, isQuickLink: false })

        it('shows all links if showAllOnLoad config is set', () => {
          const links = [link, link, link, link]
          const { wrapper } = getWrapper({ links, showAllOnLoad: true })

          expect(wrapper.findAll(linkListItemNameAndCopy).length).toBe(links.length)
        })
        it('shows only 3 links if showAllOnLoad config is not set', () => {
          const links = [link, link, link, link]
          const { wrapper } = getWrapper({ links, showAllOnLoad: false })

          expect(wrapper.findAll(linkListItemNameAndCopy).length).toBe(3)
        })
        it('button toggles to show all links', async () => {
          const links = [link, link, link, link]
          const { wrapper } = getWrapper({ links, showAllOnLoad: false })
          await wrapper.find(selectors.indirectToggle).trigger('click')

          expect(wrapper.findAll(linkListItemNameAndCopy).length).toBe(links.length)
        })
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
    it('should show the "no share permissions" message', () => {
      const { wrapper } = getWrapper({ canShare: false })
      expect(wrapper.find(selectors.noSharePermissions).exists()).toBeTruthy()
    })
  })
  describe('user does not have the permission to create public links', () => {
    const resource = mockDeep<Resource>({
      path: '/lorem.txt',
      type: 'file',
      isFolder: false,
      isReceivedShare: vi.fn(),
      canShare: () => true
    })

    it('existing viewer link is not modifiable', () => {
      const viewerLink = defaultLinksList[0]
      viewerLink.type = SharingLinkType.View
      const { wrapper } = getWrapper({ resource, abilities: [], links: [viewerLink] })
      const detailsAndEdit = wrapper.findComponent<typeof DetailsAndEdit>(
        linkListItemDetailsAndEdit
      )
      const isModifiable = detailsAndEdit.props('isModifiable')
      expect(isModifiable).toBeFalsy()
    })
    it('existing internal link is modifiable', () => {
      const internalLink = defaultLinksList[0]
      internalLink.type = SharingLinkType.Internal
      const { wrapper } = getWrapper({ resource, abilities: [], links: [internalLink] })
      const detailsAndEdit = wrapper.findComponent<typeof DetailsAndEdit>(
        linkListItemDetailsAndEdit
      )
      const isModifiable = detailsAndEdit.props('isModifiable')
      expect(isModifiable).toBeTruthy()
    })
  })
})

function getWrapper({
  resource = mockDeep<Resource>({ isFolder: false, canShare: () => true }),
  links = defaultLinksList,
  abilities = [{ action: 'create-all', subject: 'PublicLink' }],
  canShare = true,
  showAllOnLoad = true
}: {
  resource?: Resource
  links?: typeof defaultLinksList
  abilities?: AbilityRule[]
  defaultLinkPermissions?: number
  canShare?: boolean
  showAllOnLoad?: boolean
} = {}) {
  const createLinkMock = vi.fn()
  vi.mocked(useCanShare).mockReturnValue({ canShare: () => canShare })
  vi.mocked(useFileActionsCreateLink).mockReturnValue({
    actions: computed(() => [mock<FileAction>({ name: 'create-links', handler: createLinkMock })])
  })

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
    wrapper: shallowMount(FileLinks, {
      global: {
        plugins: [
          ...defaultPlugins({
            abilities,
            piniaOptions: {
              capabilityState: { capabilities },
              configState: { options: { sidebar: { shares: { showAllOnLoad } } } },
              sharesState: { linkShares: links }
            }
          })
        ],
        renderStubDefaultSlot: true,
        stubs: { OcButton: false },
        mocks,
        provide: { resource }
      }
    })
  }
}
