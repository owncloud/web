import FileLinks from 'web-app-files/src/components/SideBar/Shares/FileLinks.vue'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'

const defaultLinksList = [
  {
    id: '1',
    indirect: false,
    name: 'public link 1',
    url: 'some-link-1',
    path: '/file-1.txt',
    permissions: 1
  },
  {
    id: '2',
    indirect: true,
    name: 'public link 2',
    url: 'some-link-2',
    path: '/file-2.txt',
    permissions: 1
  }
]

const selectors = {
  linkAddButton: '#files-file-link-add',
  noResharePermissions: '[data-testid="files-links-no-reshare-permissions-message"]',
  linkNoResults: '#oc-file-links-no-results'
}

const linkListItemNameAndCopy = 'name-and-copy-stub'
const linkListItemDetailsAndEdit = 'details-and-edit-stub'

describe('FileLinks', () => {
  describe('links', () => {
    describe('when links list is not empty', () => {
      const { wrapper } = getWrapper()

      it('should render a list of direct and indirect links', () => {
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
        expect(wrapper.find(selectors.linkNoResults).exists()).toBeFalsy()
      })
    })

    it('should not render link list if no links are provided', () => {
      const { wrapper } = getWrapper({ links: [] })
      expect(wrapper.find('oc-list-stub').exists()).toBeFalsy()
    })
  })
  describe('when canCreatePublicLinks is set to true', () => {
    it('should show a button to add a link', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.linkAddButton).exists()).toBeTruthy()
    })

    describe('when the add-new-link button is clicked', () => {
      it('should call addNewLink', async () => {
        const spyAddNewLink = jest.spyOn((FileLinks as any).methods, 'addNewLink')
        const { wrapper } = getWrapper()
        expect(spyAddNewLink).toHaveBeenCalledTimes(0)
        await wrapper.find(selectors.linkAddButton).trigger('click')
        expect(spyAddNewLink).toHaveBeenCalledTimes(1)
      })
    })
  })
  describe('when canCreatePublicLinks is set to false', () => {
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
})

function getWrapper({
  resource = mockDeep<Resource>({ isFolder: false, canShare: () => true }),
  links = defaultLinksList
} = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      configuration: jest.fn(() => ({
        options: { sidebar: { shares: { showAllOnLoad: true } } }
      })),
      capabilities: jest.fn(() => {
        return {
          files_sharing: {
            public: {
              defaultPublicLinkShareName: 'public link name default',
              expire_date: new Date(),
              password: {
                enforced_for: {
                  read_only: false,
                  upload_only: false,
                  read_write: false
                }
              }
            }
          }
        }
      })
    }
  }
  defaultStoreMockOptions.modules.Files.getters.outgoingLinks.mockReturnValue(links)
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(FileLinks, {
      global: {
        plugins: [...defaultPlugins(), store],
        renderStubDefaultSlot: true,
        stubs: { OcButton: false },
        provide: {
          incomingParentShare: {},
          resource
        }
      }
    })
  }
}
