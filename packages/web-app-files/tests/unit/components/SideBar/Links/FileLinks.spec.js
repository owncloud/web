import Vuex from 'vuex'
import stubs from '@/tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import FileLinks from '@files/src/components/SideBar/Links/FileLinks.vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const mapActions = {
  loadSharesTree: jest.fn(),
  loadCurrentFileOutgoingShares: jest.fn()
}

const mapMutations = {
  TRIGGER_PUBLIC_LINK_CREATE: jest.fn()
}

const defaultLinksList = [
  {
    id: '1',
    indirect: false,
    name: 'public link 1',
    url: 'some-link-1',
    path: '/file-1.txt'
  },
  {
    id: '2',
    indirect: true,
    name: 'public link 2',
    url: 'some-link-2',
    path: '/file-2.txt'
  }
]

const selectors = {
  linkAddButton: '#files-file-link-add',
  noResharePermissions: '[data-testid="files-links-no-reshare-permissions-message"]',
  linkNoResults: '#oc-file-links-no-results',
  linkPrivate: '.oc-files-private-link-item'
}

const listItemStubSelector = 'list-item-stub'
const linkEditStubSelector = 'link-edit-stub'
const ocLoaderStubSelector = 'oc-loader-stub'

describe('FileLinks', () => {
  describe('links', () => {
    describe('when links list is not empty', () => {
      const store = createStore()
      const wrapper = getShallowWrapper(store)

      it('should render a list of links', () => {
        const linkListItems = wrapper.findAll(listItemStubSelector)

        expect(linkListItems.length).toBe(2)
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
          key: 'direct-link-2'
        })
      })

      it('should not show the "no results" message', () => {
        expect(wrapper.find(selectors.linkNoResults).exists()).toBeFalsy()
      })
    })

    it('should show the "no results" message if no links are provided', () => {
      const wrapper = getShallowWrapper(createStore({ links: [] }))

      expect(wrapper.find(selectors.linkNoResults).exists()).toBeTruthy()
      expect(wrapper.find(selectors.linkNoResults).text()).toBe('No public links')
    })
  })
  describe('when linksLoading is set to true', () => {
    it('should show the oc loader', () => {
      const store = createStore({ currentFileOutgoingSharesLoading: true })
      const wrapper = getShallowWrapper(store)

      expect(wrapper.find(ocLoaderStubSelector).exists()).toBeTruthy()
      expect(wrapper.find(ocLoaderStubSelector).attributes().arialabel).toBe(
        'Loading list of file links'
      )
    })
  })
  describe('when linksLoading is set to false', () => {
    it('should not show the oc loader', () => {
      const store = createStore()
      const wrapper = getShallowWrapper(store)

      expect(wrapper.find('oc-loader-stub').exists()).toBeFalsy()
    })

    describe('when canCreatePublicLinks is set to true', () => {
      it('should show a button to add a link', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(store)

        expect(wrapper.find(selectors.linkAddButton).exists()).toBeTruthy()
      })

      describe('when the add-new-link button is clicked', () => {
        let wrapper
        const spyAddNewLink = jest.spyOn(FileLinks.methods, 'addNewLink')
        const spyLinkCreateTrigger = jest.spyOn(mapMutations, 'TRIGGER_PUBLIC_LINK_CREATE')

        beforeEach(() => {
          const store = createStore()
          wrapper = getMountedWrapper(store)
        })

        it('should call addNewLink', async () => {
          expect(spyAddNewLink).toHaveBeenCalledTimes(0)
          expect(spyLinkCreateTrigger).toHaveBeenCalledTimes(0)

          await wrapper.find(selectors.linkAddButton).trigger('click')

          expect(spyAddNewLink).toHaveBeenCalledTimes(1)
          expect(spyLinkCreateTrigger).toHaveBeenCalledTimes(1)
        })

        it('should show link edit component', async () => {
          expect(wrapper.find(linkEditStubSelector).exists()).toBeFalsy()
          expect(wrapper.vm.currentView).toBe('showLinks')

          await wrapper.find(selectors.linkAddButton).trigger('click')

          expect(wrapper.vm.currentView).toBe('editPublicLink')
          expect(wrapper.find(linkEditStubSelector).exists()).toBeTruthy()
        })
      })
    })

    describe('when canCreatePublicLinks is set to false', () => {
      const store = createStore({
        highlightedFile: {
          path: '/lorem.txt',
          type: 'file',
          canShare: jest.fn(() => false)
        }
      })

      it('should show the "no reshare permissions" message', () => {
        const wrapper = getShallowWrapper(store)

        expect(wrapper.find(selectors.noResharePermissions).exists()).toBeTruthy()
      })
    })

    describe('when the private link functionality is disabled', () => {
      it('private link should not be visible', () => {
        const store = createStore()
        store.getters.capabilities.files.privateLinks = false
        const wrapper = getShallowWrapper(store)

        expect(wrapper.find(selectors.linkPrivate).exists()).toBeFalsy()
      })
    })
  })

  function createStore({
    links = defaultLinksList,
    highlightedFile = {
      path: '/lorem.txt',
      type: 'file',
      canShare: jest.fn(() => true)
    },
    currentFileOutgoingSharesLoading = false,
    sharesTreeLoading = false,
    expireDate = {
      enabled: true,
      days: 1,
      enforced: '1'
    },
    privateLinks = false
  } = {}) {
    return new Vuex.Store({
      getters: {
        capabilities: jest.fn(() => {
          return {
            files: {
              privateLinks: privateLinks
            },
            files_sharing: {
              public: {
                defaultPublicLinkShareName: 'public link name default',
                expire_date: expireDate
              }
            }
          }
        })
      },
      modules: {
        Files: {
          namespaced: true,
          state: {
            sharesTree: {}
          },
          getters: {
            highlightedFile: function() {
              return highlightedFile
            },
            currentFileOutgoingLinks: function() {
              return links
            },
            currentFileOutgoingSharesLoading: jest.fn(() => currentFileOutgoingSharesLoading),
            sharesTreeLoading: jest.fn(() => sharesTreeLoading)
          },
          actions: mapActions,
          mutations: mapMutations
        }
      }
    })
  }

  function getShallowWrapper(store) {
    return shallowMount(FileLinks, {
      localVue,
      store: store,
      stubs: stubs,
      provide: {
        changeView: jest.fn()
      }
    })
  }

  function getMountedWrapper(store) {
    return mount(FileLinks, {
      localVue,
      store: store,
      stubs: {
        'link-edit': true,
        'list-item': true
      },
      provide: {
        changeView: jest.fn()
      }
    })
  }
})
