import GetTextPlugin from 'vue-gettext'
import { mount } from '@vue/test-utils'
import Personal from 'packages/web-app-files/src/views/Personal.vue'
import { localVue, getStore } from './views.setup'
import { createStore } from 'vuex-extensions'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import MixinAccessibleBreadcrumb from '../../../src/mixins/accessibleBreadcrumb'
import MixinFileActions from '../../../src/mixins/fileActions'
import MixinFilesListFilter from '../../../src/mixins/filesListFilter'
import MixinFilesListScrolling from '../../../src/mixins/filesListScrolling'
import MixinFilesListPositioning from '../../../src/mixins/filesListPositioning'
import MixinFilesListPagination from '../../../src/mixins/filesListPagination'
import MixinMountSideBar from '../../../src/mixins/sidebar/mountSideBar'

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
localVue.use(VueRouter)

const configuration = {
  options: {
    disablePreviews: true
  }
}
const user = {
  id: 1,
  quota: 1
}

localVue.prototype.$client = {
  files: {
    move: jest.fn(),
    list: jest.fn(() => [])
  },
  users: {
    getUser: jest.fn(() => user)
  }
};

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'files-personal'
    }
  ]
})

jest.unmock('axios')

const stubs = {
  translate: true,
  'oc-pagination': true,
  'list-loader': true,
  'oc-table-files': true,
  'not-found-message': true,
  'quick-actions': true,
  'list-info': true
}

const resources = [
  {
    id: "forest",
    name: "forest.jpg",
    path: "images/nature/forest.jpg",
    thumbnail: "https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg",
    type: "file",
    size: "111000234",
    mdate: "Thu, 01 Jul 2021 08:34:04 GMT"
  },
  {
    id: "notes",
    name: "notes.txt",
    path: "/Documents/notes.txt",
    icon: "text",
    type: "file",
    size: "1245",
    mdate: "Thu, 01 Jul 2021 08:45:04 GMT"
  },
  {
    id: "documents",
    name: "Documents",
    path: "/Documents",
    icon: "folder",
    type: "folder",
    size: "5324435",
    mdate: "Sat, 09 Jan 2021 14:34:04 GMT"
  },
  {
    id: "pdfs",
    name: "Pdfs",
    path: "/pdfs",
    icon: "folder",
    type: "folder",
    size: "53244",
    mdate: "Sat, 09 Jan 2021 14:34:04 GMT"
  },
]

function createWrapper(selectedFiles = [
  resources[0]
]) {
  jest.spyOn(Personal.methods, 'loadResources').mockImplementation()
  jest.spyOn(MixinAccessibleBreadcrumb.methods, 'accessibleBreadcrumb_focusAndAnnounceBreadcrumb').mockImplementation()
  const component = { ...Personal, created: jest.fn(), mounted: jest.fn() }
  const wrapper = mount(component, {
    store: createStore(Vuex.Store, {
      state: {
        app: { quickActions: {} }
      },
      getters: {
        configuration: () => configuration,
        homeFolder: () => '/',
        user: () => user
      },
      mutations: {
        SET_QUOTA: () => {},
      },
      actions: {
        showMessage: () => {}
      },
      modules: {
        Files: {
          state: {
            resource: null,
            currentPage: 1
          },
          getters: {
            activeFiles: () => resources,
            inProgress: () => [null],
            currentFolder: () => '/',
            pages: () => 4,
            selectedFiles: () => selectedFiles, 
            highlightedFile: () => resources[0]
          },
          actions: {
            loadIndicators: () => {}
          },
          mutations: {
            UPDATE_CURRENT_PAGE: () => {},
            SET_FILES_PAGE_LIMIT: () => {},
            CLEAR_FILES_SEARCHED: () => {},
            SET_CURRENT_FOLDER: () => {},
            LOAD_FILES: () => {},
            CLEAR_CURRENT_FILES_LIST: () => {},
            REMOVE_FILE_FROM_SEARCHED: () => {}
          },
          namespaced: true
        }
      }
    }),
    localVue,
    router,
    stubs: stubs,
    mixins: [MixinAccessibleBreadcrumb,
      MixinFileActions,
      MixinFilesListPositioning,
      MixinFilesListScrolling,
      MixinFilesListPagination,
      MixinMountSideBar,
      MixinFilesListFilter],
    data: () => ({
      loading: false
    })
  })
  return wrapper;
}

describe('Personal component', () => {
  describe('file move with drag & drop', () => {      
    it('should exit if target is also selected', async () => {
      const spyOnGetFolderItems = jest.spyOn(Personal.methods, 'getFolderItems')
      const wrapper = createWrapper([resources[0], resources[3]]);
      await wrapper.vm.fileDropped(resources[3].id)
      expect(spyOnGetFolderItems).not.toBeCalled()
      spyOnGetFolderItems.mockReset()
    })
    it('should exit if target is not a folder', async () => {
      const spyOnGetFolderItems = jest.spyOn(Personal.methods, 'getFolderItems')
      const wrapper = createWrapper([resources[2]]);
      await wrapper.vm.fileDropped(resources[0].id)
      expect(spyOnGetFolderItems).not.toBeCalled()
      spyOnGetFolderItems.mockReset()
    })
    it('should not move file if resource is already in target', async () => {
      const spyOnGetFolderItems = jest.spyOn(Personal.methods, 'getFolderItems').mockResolvedValueOnce([resources[2]])
      const spyOnMoveFiles = jest.spyOn(localVue.prototype.$client.files, 'move')

      const wrapper = createWrapper([resources[2]]);
      await wrapper.vm.fileDropped(resources[3].id)
      expect(spyOnMoveFiles).not.toBeCalled()

      spyOnMoveFiles.mockReset()
      spyOnGetFolderItems.mockReset()
    })
    it('should move a file', async () => {
      const spyOnGetFolderItems = jest.spyOn(Personal.methods, 'getFolderItems').mockResolvedValueOnce([])
      const spyOnMoveFilesMove = jest.spyOn(localVue.prototype.$client.files, 'move').mockImplementation()

      const wrapper = createWrapper([resources[2]]);
      await wrapper.vm.fileDropped(resources[3].id)
      expect(spyOnMoveFilesMove).toBeCalled()

      spyOnMoveFilesMove.mockReset()
      spyOnGetFolderItems.mockReset()
    })
  })
})
