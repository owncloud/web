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
  indicators: [],
  canRename: jest.fn
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

export const routes = [
  {
    path: '/files/shares/with-me/',
    name: 'files-shares-with-me'
  },
  {
    path: '/files/shares/with-others/',
    name: 'files-shares-with-others'
  },
  {
    path: '/files/shares/via-link/',
    name: 'files-shares-via-link'
  },
  {
    path: '/files/trash/personal/',
    name: 'files-trash-personal'
  },
  {
    path: '/files/trash/spaces/project/',
    name: 'files-trash-spaces-project'
  },
  {
    path: '/files/spaces/personal/home/',
    name: 'files-spaces-personal'
  },
  {
    path: '/files/spaces/project/',
    name: 'files-spaces-project'
  },
  {
    path: '/files/spaces/share/',
    name: 'files-spaces-share'
  },
  {
    path: '/files/public/files/',
    name: 'files-public-files'
  },
  {
    path: '/files/common/favorites/',
    name: 'files-common-favorites'
  }
]

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
  currentFolder = null,
  selectedFiles = [],
  totalFilesCount = null,
  totalFilesSize = null,
  loginBackgroundImg = '',
  loginLogo = '',
  davProperties = [],
  accessToken = '',
  publicLinkPassword = null,
  slogan = null,
  user = { id: 'test' },
  generalThemeName = '',
  capabilities = {},
  selectedResourcesForMove = null
} = {}) {
  return createStore(Vuex.Store, {
    state: {
      app: { quickActions: {} }
    },
    getters: {
      configuration: () => ({
        server: 'https://owncloud.test',
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
        namespaced: true,
        state: {
          resource: null,
          filesPageLimit: 100,
          files: [],
          activeFiles: activeFiles,
          currentFolder: currentFolder,
          currentPage: currentPage,
          selectedIds: selectedFiles ? selectedFiles.map((file) => file.id) : [],
          selectedResourcesForMove: selectedResourcesForMove
        },
        getters: {
          totalFilesCount: () => totalFilesCount,
          totalFilesSize: () => totalFilesSize,
          selectedFiles: () => selectedFiles,
          activeFiles: (state) => state.activeFiles,
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
          SET_HIDDEN_FILES_VISIBILITY: jest.fn(),
          SET_FILE_EXTENSIONS_VISIBILITY: jest.fn(),
          CLEAR_FILES_SEARCHED: () => {},
          CLEAR_CURRENT_FILES_LIST: () => {},
          LOAD_FILES: () => {},
          SET_FILES_PAGE_LIMIT: () => {},
          SET_CURRENT_FOLDER: () => {},
          REMOVE_FILES: () => {},
          REMOVE_FILES_FROM_SEARCHED: () => {},
          REMOVE_FILE_SELECTION: () => {},
          SET_FILE_SELECTION: () => {},
          SET_SELECTED_IDS: () => {}
        },
        actions: {
          loadIndicators: () => {},
          loadFiles: () => {}
        }
      },
      runtime: {
        namespaced: true,
        modules: {
          auth: {
            namespaced: true,
            getters: {
              accessToken: () => accessToken,
              publicLinkPassword: () => publicLinkPassword
            }
          },
          spaces: {
            namespaced: true,
            state: {
              spaces: []
            }
          }
        }
      },
      user: { state: user }
    }
  })
}
