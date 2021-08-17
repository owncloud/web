import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

import List from '@files/src/components/Search/List.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const stubs = {
  'no-content-message': false,
  'oc-table-files': false,
  pagination: true,
  'list-info': true
}

const selectors = {
  noContentMessage: '.files-empty',
  filesTable: '.files-table',
  pagination: 'pagination-stub',
  listInfo: 'list-info-stub'
}

const files = [
  {
    id: 1,
    path: 'lorem.txt',
    size: 100
  },
  {
    id: 2,
    path: 'lorem.pdf',
    size: 50
  }
]

describe('List component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe.each(['No search term entered', 'No resource found'])('when %s', message => {
    let wrapper
    beforeEach(() => {
      if (message === 'No search term entered') {
        wrapper = getWrapper()
      } else {
        wrapper = getWrapper('epsum.txt')
      }
    })

    it('should show text "' + message + '"', () => {
      const noContentMessage = wrapper.find(selectors.noContentMessage)
      const filesTable = wrapper.find(selectors.filesTable)

      expect(filesTable.exists()).toBeFalsy()
      expect(noContentMessage.exists()).toBeTruthy()
      expect(noContentMessage.text()).toEqual(message)
    })
    it('should not show files table', () => {
      const filesTable = wrapper.find(selectors.filesTable)
      const listInfo = wrapper.find(selectors.listInfo)

      expect(filesTable.exists()).toBeFalsy()
      expect(listInfo.exists()).toBeFalsy()
    })
  })

  describe('when resources are found', () => {
    const spyTriggerDefaultAction = jest
      .spyOn(List.mixins[0].methods, '$_fileActions_triggerDefaultAction')
      .mockImplementation()
    const spyRowMounted = jest.spyOn(List.methods, 'rowMounted')

    let wrapper
    beforeEach(() => {
      wrapper = getWrapper('lorem', files)
    })

    it('should not show no-content-message component', () => {
      const noContentMessage = wrapper.find(selectors.noContentMessage)

      expect(noContentMessage.exists()).toBeFalsy()
    })
    it('should show files table with pagination', () => {
      const filesTable = wrapper.find(selectors.filesTable)
      const pagination = wrapper.find(selectors.pagination)

      expect(filesTable.exists()).toBeTruthy()
      expect(filesTable.props().resources).toMatchObject(files)
      expect(pagination.exists()).toBeTruthy()
    })
    it('should set correct props on list-info component', () => {
      const listInfo = wrapper.find(selectors.listInfo)

      expect(listInfo.exists()).toBeTruthy()
      expect(listInfo.props().files).toEqual(files.length)
      expect(listInfo.props().folders).toEqual(0)
      expect(listInfo.props().size).toEqual(getTotalSize(files))
    })
    it('should trigger the default action when a "fileClick" event gets emitted', async () => {
      const filesTable = wrapper.find(selectors.filesTable)

      expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(0)

      await filesTable.vm.$emit('fileClick')

      expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(1)
    })
    it('should lazily load previews when a "rowMounted" event gets emitted', () => {
      expect(spyRowMounted).toHaveBeenCalledTimes(files.length)
    })
  })
})

function getWrapper(searchTerm = '', files = []) {
  return mount(List, {
    localVue,
    propsData: {
      searchResults: getSearchResults(files)
    },
    store: createStore(files),
    mocks: {
      $route: {
        query: {
          term: searchTerm
        },
        params: {
          page: 1
        }
      }
    },
    stubs
  })
}

function createStore(activeFiles) {
  return new Vuex.Store({
    getters: {
      configuration: () => ({
        options: {
          disablePreviews: true
        }
      })
    },
    modules: {
      Files: {
        namespaced: true,
        getters: {
          activeFiles: () => activeFiles,
          totalFilesCount: () => ({ files: activeFiles.length, folders: 0 }),
          totalFilesSize: () => getTotalSize(activeFiles),
          pages: jest.fn()
        },
        mutations: {
          CLEAR_CURRENT_FILES_LIST: jest.fn(),
          LOAD_FILES: jest.fn(),
          UPDATE_CURRENT_PAGE: jest.fn()
        }
      }
    }
  })
}

function getSearchResults(files) {
  return files.map(file => ({ data: file, id: file.id }))
}

function getTotalSize(files) {
  return files.reduce((total, file) => total + file.size, 0)
}
