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

const mapActions = {
  loadSharesTree: jest.fn(),
  loadCurrentFileOutgoingShares: jest.fn()
}

const mapMutations = {
  TRIGGER_PUBLIC_LINK_CREATE: jest.fn()
}

describe('FileLinks', () => {
  const selectors = {
    linkAddButton: '#files-file-link-add',
    noResharePermissions: 'p[data-testid="files-links-no-reshare-permissions-message"]',
    linkNoResults: '#oc-file-links-no-results',
    listItemStub: 'list-item-stub'
  }

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
            currentFileOutgoingLinks: function () {
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

  describe('current view', () => {
    describe('when view is to show', () => {
      describe('links', () => {
        describe('when links list is not empty', () => {
          const store = createStore()
          const wrapper = getShallowWrapper(store)
          it('should render list of items of provided links', () => {
            const linkListItems = wrapper.findAll(selectors.listItemStub)
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
            expect(wrapper.find(selectors.linkNoResults).exists()).toBeFalsy()
          })
          it('should not show no results', () => {
            expect(wrapper.find(selectors.linkNoResults).exists()).toBeFalsy()
          })
        })

        it('should show no results if no links is provided', () => {
          const wrapper = getShallowWrapper(createStore({links: []}))
          expect(wrapper.find(selectors.linkNoResults).exists()).toBeTruthy()
        })
      })
      describe('when linksLoading is true', () => {
        it('should show oc loader', () => {
          const store = createStore({ currentFileOutgoingSharesLoading: true })
          const wrapper = getShallowWrapper(store)

          expect(wrapper.find('oc-loader-stub').exists()).toBeTruthy()
          expect(wrapper.find('oc-loader-stub').attributes().arialabel).toBe('Loading list of file links')
        })
      })
      describe('when linksLoading is false', () => {
        it('should not show oc loader', () => {
          const store = createStore()
          const wrapper = getShallowWrapper(store)

          expect(wrapper.find('oc-loader-stub').exists()).toBeFalsy()
        })
        describe('when canCreatePublicLinks is true', () => {
          it('should show link add button', () => {
            const store = createStore()
            const wrapper = getShallowWrapper(store)

            expect(wrapper.find(selectors.linkAddButton).exists()).toBeTruthy()
          })
          describe('when add new link button is clicked', () => {

            let wrapper
            const spyAddNewLink = jest.spyOn(FileLinks.methods, 'addNewLink')
            const spyLinkCreateTrigger = jest.spyOn(mapMutations, 'TRIGGER_PUBLIC_LINK_CREATE')

            beforeEach(() => {
              const store = createStore()
              wrapper = getMountedWrapper(store)
             })

            it('should call addNewLink', async () => {

              await wrapper.find(selectors.linkAddButton).trigger('click')

              expect(spyAddNewLink).toHaveBeenCalledTimes(1)
              expect(spyLinkCreateTrigger).toHaveBeenCalledTimes(1)
            })
            it('should show link edit component', async () => {
              expect(wrapper.find('link-edit-stub').exists()).toBeFalsy()
              expect(wrapper.vm.currentView).toBe('showLinks')

              await wrapper.find(selectors.linkAddButton).trigger('click')

              expect(wrapper.vm.currentView).toBe('editPublicLink')
              expect(wrapper.find('link-edit-stub').exists()).toBeTruthy()
            })
          })
        })
        describe('when canCreatePublicLinks is false', () => {
          it('should show no reshare permissions message', () => {
            const store = createStore({
              highlightedFile: {
                path: '/lorem.txt',
                type: 'file',
                canShare: jest.fn(() => false)
              }
            })
            const wrapper = getShallowWrapper(store)

            expect(wrapper.find(selectors.noResharePermissions).exists()).toBeTruthy()
          })
        })
      })
    })
  })
})
