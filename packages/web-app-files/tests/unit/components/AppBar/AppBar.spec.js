import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

import AppBar from '@files/src/components/AppBar/AppBar'
import {
  createLocationCommon,
  createLocationPublic,
  createLocationShares,
  createLocationSpaces,
  createLocationTrash
} from '../../../../src/router'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const elSelector = {
  batchActions: 'batch-actions-stub',
  sizeInfo: 'size-info-stub',
  createAndUpload: 'create-and-upload-stub'
}

const personalHomeLocation = createLocationSpaces('files-spaces-personal-home')
const sharesWithMeLocation = createLocationShares('files-shares-with-me')
const sharesWithOthersLocation = createLocationShares('files-shares-with-others')
const publicFilesLocation = createLocationPublic('files-public-files')
const favoritesLocation = createLocationCommon('files-common-favorites')

const selectedFiles = [
  {
    path: '/lorem.txt',
    canBeDeleted: jest.fn(() => true)
  }
]

const currentFolder = {
  path: '/',
  canUpload: jest.fn(() => true),
  canCreate: jest.fn(() => true),
  canBeDeleted: jest.fn(() => true)
}

describe('AppBar component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe.each([personalHomeLocation.name, publicFilesLocation.name])('%s route', (page) => {
    const route = {
      name: page,
      params: {
        // item is the link token for public links (root of the public link) vs. empty for personal page (root of the home)
        item: page === publicFilesLocation.name ? '6mfXfTtYHVxrlAu' : ''
      },
      meta: {
        hasBulkActions: true,
        hideFilelistActions: false
      }
    }

    describe('when no items are selected', () => {
      it('should only show create and upload component', () => {
        const store = createStore({ selected: [], currentFolder })
        const wrapper = getShallowWrapper(route, store)
        const createAndUpload = wrapper.find(elSelector.createAndUpload)
        const sizeInfo = wrapper.find(elSelector.sizeInfo)

        expect(createAndUpload.exists()).toBeTruthy()
        expect(sizeInfo.exists()).toBeFalsy()
      })
    })

    describe('when an item is selected', () => {
      it('should hide create and upload component but show size info', () => {
        const store = createStore({ currentFolder, selected: selectedFiles })
        const wrapper = getShallowWrapper(route, store)
        const createAndUpload = wrapper.find(elSelector.createAndUpload)
        const sizeInfo = wrapper.find(elSelector.sizeInfo)

        expect(createAndUpload.exists()).toBeFalsy()
        expect(sizeInfo.isVisible()).toBeTruthy()
      })
    })
  })

  describe('files-trashbin route', () => {
    const route = {
      name: 'files-trashbin',
      params: {},
      meta: {
        hasBulkActions: true,
        hideFilelistActions: true
      }
    }

    let wrapper
    beforeEach(() => {
      const store = createStore({ selected: [], currentFolder })
      wrapper = getShallowWrapper(route, store)
    })

    it('should never show create and upload component', () => {
      const createAndUpload = wrapper.find(elSelector.createAndUpload)
      expect(createAndUpload.exists()).toBeFalsy()
    })

    describe('when no items are selected', () => {
      it('should not show size-info', () => {
        const sizeInfo = wrapper.find(elSelector.sizeInfo)
        expect(sizeInfo.exists()).toBeFalsy()
      })
      it('should show batch actions', () => {
        const batchActions = wrapper.find(elSelector.batchActions)
        expect(batchActions.exists()).toBeTruthy()
      })
    })

    describe('when an item is selected', () => {
      it('should show size info and batch actions', () => {
        const store = createStore({ currentFolder, selected: selectedFiles })
        wrapper = getShallowWrapper(route, store)

        const sizeInfo = wrapper.find(elSelector.sizeInfo)
        const batchActions = wrapper.find(elSelector.batchActions)

        expect(sizeInfo.isVisible()).toBeTruthy()
        expect(batchActions.isVisible()).toBeTruthy()
      })
    })
  })

  describe('computed showContextActions', () => {
    describe('if isPersonalLocation is true', () => {
      describe('and item is selected', () => {
        it('should be true', () => {
          const store = createStore({ selected: [], currentFolder })
          const route = {
            ...createLocationSpaces('files-spaces-personal-home', {
              params: {
                storageId: '1',
                item: 'New folder'
              }
            }),
            meta: {}
          }

          const wrapper = getShallowWrapper(route, store, {
            isPersonalLocation: true
          })
          expect(wrapper.vm.showContextActions).toBeTruthy()
        })
      })
      describe('and no item is selected', () => {
        it('should be false', () => {
          const store = createStore({ selected: [], currentFolder })
          const route = {
            ...createLocationSpaces('files-spaces-personal-home', {
              params: {
                storageId: '1'
              }
            }),
            meta: {}
          }

          const wrapper = getShallowWrapper(route, store, {
            isPersonalLocation: true
          })
          expect(wrapper.vm.showContextActions).toBeFalsy()
        })
      })
    })

    describe('if isSpacesProjectLocation is true', () => {
      describe('and item is selected', () => {
        it('should be true', () => {
          const store = createStore({ selected: [], currentFolder })
          const route = {
            ...createLocationTrash('files-trash-personal', {
              params: {
                storageId: '1',
                item: 'New folder'
              }
            }),
            meta: {}
          }

          const wrapper = getShallowWrapper(route, store, {
            isSpacesProjectLocation: true
          })
          expect(wrapper.vm.showContextActions).toBeTruthy()
        })
      })

      describe('and no item is selected', () => {
        it('should be false', () => {
          const store = createStore({ selected: [], currentFolder })
          const route = {
            ...createLocationTrash('files-trash-personal', {
              params: {
                storageId: '1'
              }
            }),
            meta: {}
          }

          const wrapper = getShallowWrapper(route, store, {
            isSpacesProjectLocation: true
          })
          expect(wrapper.vm.showContextActions).toBeFalsy()
        })
      })
    })

    describe('if isTrashPersonalActive is true', () => {
      it('should be false', () => {
        const store = createStore({ selected: [], currentFolder })
        const route = {
          ...createLocationTrash('files-trash-personal', {
            params: {
              storageId: '1'
            }
          }),
          meta: {}
        }
        const wrapper = getShallowWrapper(route, store, { isTrashPersonalActive: true })
        expect(wrapper.vm.showContextActions).toBeFalsy()
      })
    })
  })

  describe('computed contextActionItems', () => {
    it('should be empty if isTrashSpacesProjectActive is true', () => {
      const store = createStore({ selected: [], currentFolder })
      const route = {
        ...createLocationTrash('files-trash-personal', {
          params: {
            storageId: '1'
          }
        }),
        meta: {}
      }
      const wrapper = getShallowWrapper(route, store, { isTrashSpacesProjectActive: true })
      expect(wrapper.vm.contextActionItems).toEqual([])
    })

    it('should not be empty if isTrashPersonalActive is true', () => {
      const store = createStore({ selected: [], currentFolder })
      const route = {
        ...createLocationTrash('files-trash-personal', {
          params: {
            storageId: '1'
          }
        }),
        meta: {}
      }
      const wrapper = getShallowWrapper(route, store, { isTrashPersonalActive: true })
      expect(wrapper.vm.contextActionItems).toEqual([wrapper.vm.currentFolder])
    })
  })

  describe('computed breadcrumbs', () => {
    it('should contain two items if isTrashPersonalActive is true', () => {
      const store = createStore({ selected: [], currentFolder })
      const route = {
        ...createLocationTrash('files-trash-personal', {
          params: {
            storageId: '1'
          }
        }),
        meta: {}
      }
      const wrapper = getShallowWrapper(route, store, { isTrashSpacesProjectActive: true })
      expect(wrapper.vm.breadcrumbs[0].to).toEqual('/files/trash')
      expect(wrapper.vm.breadcrumbs.length).toEqual(2)
    })

    it('should contain two items if isTrashSpacesProjectActive is true', () => {
      const store = createStore({ selected: [], currentFolder })
      const route = {
        ...createLocationTrash('files-trash-spaces-project', {
          params: {
            storageId: '1'
          }
        }),
        meta: {}
      }
      const wrapper = getShallowWrapper(route, store, { isTrashSpacesProjectActive: true })
      expect(wrapper.vm.breadcrumbs[0].to).toEqual('/files/trash')
      expect(wrapper.vm.breadcrumbs.length).toEqual(2)
    })
  })

  describe.each([favoritesLocation.name, sharesWithOthersLocation.name, sharesWithMeLocation.name])(
    '%s page',
    (page) => {
      const route = {
        name: page,
        params: {},
        meta: {
          hasBulkActions: true,
          hideFilelistActions: true
        }
      }

      let wrapper
      beforeEach(() => {
        const store = createStore({ selected: [], currentFolder })
        wrapper = getShallowWrapper(route, store)
      })

      it('should never show create and upload component', () => {
        const createAndUpload = wrapper.find(elSelector.createAndUpload)
        expect(createAndUpload.exists()).toBeFalsy()
      })

      describe('when no items are selected', () => {
        it('should not show size-info', () => {
          const sizeInfo = wrapper.find(elSelector.sizeInfo)
          expect(sizeInfo.exists()).toBeFalsy()
        })
        it('should show batch actions', () => {
          const batchActions = wrapper.find(elSelector.batchActions)
          expect(batchActions.exists()).toBeTruthy()
        })
      })

      describe('when an item is selected', () => {
        it('should show size info and batch actions', () => {
          const store = createStore({ currentFolder, selected: selectedFiles })
          wrapper = getShallowWrapper(route, store)

          const sizeInfo = wrapper.find(elSelector.sizeInfo)
          const batchActions = wrapper.find(elSelector.batchActions)

          expect(sizeInfo.isVisible()).toBeTruthy()
          expect(batchActions.isVisible()).toBeTruthy()
        })
      })
    }
  )
})

function getShallowWrapper(route = {}, store = {}, mocks = {}) {
  return shallowMount(AppBar, {
    localVue,
    mocks: {
      $route: route,
      $router: {
        currentRoute: route,
        resolve: (r) => {
          return { href: r.name }
        }
      },
      publicPage: jest.fn(() => false),
      ...mocks
    },
    store
  })
}

function createStore(state = { selected: [], currentFolder: {} }, fileHandlers = []) {
  return new Vuex.Store({
    getters: {
      getToken: jest.fn(),
      quota: jest.fn(),
      user: function () {
        return { id: 'alice' }
      }
    },
    modules: {
      Files: {
        namespaced: true,
        state: {
          currentFolder: {
            path: '/'
          },
          ...state
        },
        getters: {
          selectedFiles: () => state.selected,
          currentFolder: () => state.currentFolder
        },
        mutations: {
          SET_HIDDEN_FILES_VISIBILITY: jest.fn()
        }
      }
    }
  })
}
