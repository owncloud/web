import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import OwnCloud from 'owncloud-sdk'
import { createStore } from 'vuex-extensions'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'
import VueCompositionAPI from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services/client'

export const createFile = ({ id, status = 1, type = 'folder' }) => ({
  id: `file-id-${id}`,
  type,
  status,
  name: `file-name-${id}`,
  path: `/file-path/${id}`,
  extension: '',
  share: {
    id: `file-share-id-${id}`
  },
  indicators: []
})

export const localVue = createLocalVue()
localVue.prototype.$client = new OwnCloud()
localVue.prototype.$client.init({ baseUrl: 'http://none.de' })
localVue.prototype.$clientService = clientService
localVue.prototype.$clientService.owncloudSdk = localVue.prototype.$client
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(VueCompositionAPI)

/*
 * TODO: options on GetTextPlugin do not have any effect because of
 * packages/web-app-files/src/gettext.js which overwrites every setting.
 */
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

// mock `v-translate` directive
localVue.directive('translate', {
  inserted: (el) => {}
})

export const getRouter = ({ query = {} }) => ({
  afterEach: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  currentRoute: {
    query
  }
})

export const getStore = function ({
  highlightedFile = null,
  disablePreviews = true,
  currentPage = null,
  activeFiles = [],
  pages = null,
  sidebarClosed = false,
  currentFolder = null,
  inProgress = [null],
  selectedFiles = [],
  totalFilesCount = null,
  totalFilesSize = null,
  loginBackgroundImg = '',
  loginLogo = '',
  davProperties = [],
  publicLinkPassword = null,
  slogan = null,
  user = null,
  generalThemeName = '',
  capabilities = {},
  selectedResourcesForMove = null,
  locationPickerTargetFolder = null
} = {}) {
  return createStore(Vuex.Store, {
    state: {
      app: { quickActions: {} }
    },
    getters: {
      configuration: () => ({
        currentTheme: {
          loginPage: {
            backgroundImg: loginBackgroundImg
          },
          logo: {
            login: loginLogo
          },
          general: {
            name: generalThemeName,
            slogan: slogan
          }
        },
        options: {
          disablePreviews: disablePreviews
        }
      }),
      capabilities: () => capabilities,
      getToken: () => '',
      homeFolder: () => '/',
      user: () => user
    },
    mutations: {
      SET_QUOTA: () => {}
    },
    actions: {
      showMessage: () => {}
    },
    modules: {
      Files: {
        state: {
          resource: null,
          filesPageLimit: 100,
          files: [],
          activeFiles: activeFiles,
          currentFolder: currentFolder,
          currentPage: currentPage,
          selectedResourcesForMove: selectedResourcesForMove,
          locationPickerTargetFolder: locationPickerTargetFolder
        },
        getters: {
          totalFilesCount: () => totalFilesCount,
          totalFilesSize: () => totalFilesSize,
          selectedFiles: () => selectedFiles,
          activeFiles: (state) => state.activeFiles,
          inProgress: () => inProgress,
          highlightedFile: () => highlightedFile,
          currentFolder: () => currentFolder,
          pages: () => pages,
          davProperties: () => davProperties,
          publicLinkPassword: () => publicLinkPassword
        },
        mutations: {
          UPDATE_RESOURCE: (state, resource) => {
            state.resource = resource
          },
          UPSERT_RESOURCE: (state, resource) => {
            state.activeFiles.push(resource)
          },
          CLEAR_FILES_SEARCHED: () => {},
          CLEAR_CURRENT_FILES_LIST: () => {},
          LOAD_FILES: () => {},
          SET_FILES_PAGE_LIMIT: () => {},
          SET_CURRENT_FOLDER: () => {},
          REMOVE_FILE: () => {},
          REMOVE_FILE_FROM_SEARCHED: () => {},
          REMOVE_FILE_SELECTION: () => {},
          SET_FILE_SELECTION: () => {}
        },
        actions: {
          loadIndicators: () => {},
          loadFiles: () => {}
        },
        namespaced: true,
        modules: {
          sidebar: {
            state: {
              closed: sidebarClosed
            },
            namespaced: true
          },
          pagination: {
            state: {
              currentPage,
              itemsPerPage: 100
            },
            getters: {
              pages: () => pages
            },
            mutations: {
              SET_ITEMS_PER_PAGE: () => {},
              UPDATE_CURRENT_PAGE: () => {}
            },
            namespaced: true
          }
        }
      },
      user: { state: user }
    }
  })
}
