import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import OwnCloud from 'owncloud-sdk'
import { createStore } from 'vuex-extensions'
import DesignSystem from 'owncloud-design-system'

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
localVue.use(Vuex)
localVue.use(DesignSystem)

export const getStore = function({
  highlightedFile = null,
  configuration = {
    options: {
      disablePreviews: true
    }
  },
  activeFiles = [createFile({ id: 1 }), createFile({ id: 2, status: 2 })],
  pages = 4
} = {}) {
  return createStore(Vuex.Store, {
    state: {
      app: { quickActions: {} }
    },
    getters: {
      configuration: () => configuration,
      getToken: () => '',
      isOcis: () => true
    },
    modules: {
      Files: {
        state: {
          resource: null,
          currentPage: 3,
          filesPageLimit: 100
        },
        getters: {
          totalFilesCount: () => ({ files: 15, folders: 20 }),
          totalFilesSize: () => 1024,
          selectedFiles: () => [],
          activeFiles: () => activeFiles,
          activeFilesCount: () => ({ files: 0, folders: 1 }),
          inProgress: () => [null],
          highlightedFile: () => highlightedFile,
          pages: () => pages
        },
        mutations: {
          UPDATE_RESOURCE: (state, resource) => {
            state.resource = resource
          },
          UPDATE_CURRENT_PAGE: () => {},
          SET_FILES_PAGE_LIMIT: () => {}
        },
        namespaced: true
      }
    }
  })
}
