import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

import stubs from '@/tests/unit/stubs'
import AppBar from '@files/src/components/AppBar/AppBar'

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
  newFileButton: '#new-file-menu-btn',
  ocDrop: 'oc-drop-stub',
  fileMenuList: 'oc-drop-stub .uk-list > li',
  fileUpload: 'file-upload-stub',
  folderUpload: 'folder-upload-stub',
  newFolderBtn: '#new-folder-btn',
  newTextFileBtn: '.new-file-btn-txt',
  newMdFileBtn: '.new-file-btn-md',
  newDrawioFileBtn: '.new-file-btn-drawio'
}

const routes = [
  'files-personal',
  'files-favorites',
  'files-shared-with-others',
  'files-shared-with-me',
  'files-public-list'
]

const newFileHandlers = [
  {
    ext: 'txt',
    action: {
      app: 'markdown-editor',
      newTab: false,
      extension: 'txt',
      routes
    },
    menuTitle: () => 'New plain text file...'
  },
  {
    ext: 'md',
    action: {
      app: 'markdown-editor',
      newTab: false,
      extension: 'md',
      routes
    },
    menuTitle: () => 'New mark-down file...'
  },
  {
    ext: 'drawio',
    action: {
      app: 'draw-io',
      newTab: true,
      routeName: 'draw-io-edit',
      extension: 'drawio',
      routes
    },
    menuTitle: () => 'New draw.io document...'
  }
]

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

  describe.each(['files-personal', 'files-public-list'])('%s route', (page) => {
    const route = {
      name: page,
      params: {
        // item is the link token for public links (root of the public link) vs. empty for personal page (root of the home)
        item: page === 'files-public-list' ? '6mfXfTtYHVxrlAu' : ''
      },
      meta: {
        hasBulkActions: true,
        hideFilelistActions: false
      }
    }

    describe('when no items are selected', () => {
      let wrapper

      const spyShowCreateResourceModal = jest
        .spyOn(AppBar.methods, 'showCreateResourceModal')
        .mockImplementation()

      beforeEach(() => {
        const store = createStore({ selected: [], currentFolder })
        wrapper = getShallowWrapper(route, store)
      })

      it('should show "New" button', () => {
        const newButton = wrapper.find(elSelector.newFileButton)
        const sizeInfo = wrapper.find(elSelector.sizeInfo)

        expect(sizeInfo.exists()).toBeFalsy()
        expect(newButton.isVisible()).toBeTruthy()
        expect(newButton.props('ariaLabel')).toEqual('Add files or folders')
      })
      it('should show default file menu items', () => {
        const ocDrop = wrapper.find(elSelector.ocDrop)
        const fileUpload = wrapper.find(elSelector.fileUpload)
        const folderUpload = wrapper.find(elSelector.folderUpload)
        const newFolderBtn = wrapper.find(elSelector.newFolderBtn)
        const fileMenuList = wrapper.findAll(elSelector.fileMenuList)

        expect(ocDrop.isVisible()).toBeTruthy()
        expect(fileUpload.isVisible()).toBeTruthy()
        expect(folderUpload.isVisible()).toBeTruthy()
        expect(newFolderBtn.isVisible()).toBeTruthy()
        expect(fileMenuList.length).toBe(3)
      })
      it('should trigger "showCreateResourceModal" if new-folder button is clicked', async () => {
        const store = createStore({ currentFolder, selected: [] })
        wrapper = getWrapper(route, store)

        const newFolderBtn = wrapper.find(elSelector.newFolderBtn)
        await newFolderBtn.trigger('click')

        expect(spyShowCreateResourceModal).toHaveBeenCalled()
      })
      it('should show extra file menu items', () => {
        const store = createStore({ currentFolder, selected: [] }, newFileHandlers)
        wrapper = getShallowWrapper(route, store)
        const newTextFileBtn = wrapper.find(elSelector.newTextFileBtn)
        const newMdFileBtn = wrapper.find(elSelector.newMdFileBtn)
        const newDrawioFileBtn = wrapper.find(elSelector.newDrawioFileBtn)
        const fileMenuList = wrapper.findAll(elSelector.fileMenuList)

        expect(newTextFileBtn.isVisible()).toBeTruthy()
        expect(newMdFileBtn.isVisible()).toBeTruthy()
        expect(newDrawioFileBtn.isVisible()).toBeTruthy()
        expect(fileMenuList.length).toBe(6)
      })
      it.each(newFileHandlers)(
        'should trigger "showCreateResourceModal" if new file button is clicked',
        async (fileHandler) => {
          const store = createStore({ currentFolder, selected: [] }, newFileHandlers)
          wrapper = getWrapper(route, store)

          const button = wrapper.find(getFileHandlerSelector(fileHandler.ext))
          await button.trigger('click')

          expect(spyShowCreateResourceModal).toHaveBeenCalled()
          expect(spyShowCreateResourceModal).toHaveBeenCalledWith(
            false,
            fileHandler.ext,
            fileHandler.action
          )
        }
      )
    })

    describe('when an item is selected', () => {
      it('should hide "New" button but show size info', () => {
        const store = createStore({ currentFolder, selected: selectedFiles })
        const wrapper = getShallowWrapper(route, store)
        const newButton = wrapper.find(elSelector.newFileButton)
        const ocDrop = wrapper.find(elSelector.ocDrop)
        const sizeInfo = wrapper.find(elSelector.sizeInfo)

        expect(newButton.exists()).toBeFalsy()
        expect(ocDrop.exists()).toBeFalsy()
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

    it('should not show "New" button and file menu list', () => {
      const newButton = wrapper.find(elSelector.newFileButton)
      const ocDrop = wrapper.find(elSelector.ocDrop)

      expect(newButton.exists()).toBeFalsy()
      expect(ocDrop.exists()).toBeFalsy()
    })

    describe('when no items are selected', () => {
      it('should show batch actions but not size-info', () => {
        const batchActions = wrapper.find(elSelector.batchActions)
        const sizeInfo = wrapper.find(elSelector.sizeInfo)

        expect(sizeInfo.exists()).toBeFalsy()
        expect(batchActions.isVisible()).toBeTruthy()
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

  describe.each(['files-favorites', 'files-shared-with-others', 'files-shared-with-me'])(
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

      describe('when no items are selected', () => {
        it('should not show "New" button and file menu list', () => {
          const newButton = wrapper.find(elSelector.newFileButton)
          const ocDrop = wrapper.find(elSelector.ocDrop)

          expect(newButton.exists()).toBeFalsy()
          expect(ocDrop.exists()).toBeFalsy()
        })
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

function getFileHandlerSelector(extension) {
  if (extension === 'txt') {
    return elSelector.newTextFileBtn
  } else if (extension === 'md') {
    return elSelector.newMdFileBtn
  } else if (extension === 'drawio') {
    return elSelector.newDrawioFileBtn
  }
  return null
}

function getWrapper(route = {}, store = {}) {
  return mount(AppBar, {
    localVue,
    mocks: {
      $route: route,
      publicPage: jest.fn(() => false),
      isIE11: jest.fn(() => false)
    },
    stubs: {
      ...stubs,
      'oc-button': false,
      'size-info': true,
      'batch-actions': true,
      'view-options': true,
      'file-drop': true,
      'file-upload': true,
      'folder-upload': true
    },
    store
  })
}

function getShallowWrapper(route = {}, store = {}) {
  return shallowMount(AppBar, {
    localVue,
    mocks: {
      $route: route,
      publicPage: jest.fn(() => false),
      isIE11: jest.fn(() => false)
    },
    store
  })
}

function createStore(state = { selected: [], currentFolder: {} }, fileHandlers = []) {
  return new Vuex.Store({
    getters: {
      getToken: jest.fn(),
      newFileHandlers: jest.fn(() => fileHandlers),
      quota: jest.fn()
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
