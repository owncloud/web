import GetTextPlugin from 'vue-gettext'
import { RouterLinkStub, shallowMount } from '@vue/test-utils'
import { localVue } from '../views.setup'
import { createStore } from 'vuex-extensions'
import Files from '@/__fixtures__/files'
import mockAxios from 'jest-mock-axios'
import SpaceProject from '../../../../src/views/spaces/Project.vue'
import { buildResource } from '@files/src/helpers/resources'
import Vuex from 'vuex'

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const composables = '@files/src/composables/index'
jest.mock(composables, () => ({
  ...jest.requireActual(composables),
  usePagination: jest.fn(({ page, items, sortDir, sortBy }) => {
    return {
      items,
      total: 1,
      perPage: 10
    }
  })
}))

beforeEach(mockAxios.reset)

afterEach(() => {
  jest.unmock(composables)
})

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn()
  }))

const selectors = {
  spaceImage: '.space-overview-image',
  markdownContainer: '.markdown-container',
  emptySpace: '#files-space-empty',
  noSpace: '.space-not-found'
}

const spaceMocks = {
  noSpace: {},
  spaceWithReadmeAndImage: {
    id: 1,
    name: 'space',
    special: [
      {
        specialFolder: { name: 'readme' }
      },
      {
        specialFolder: { name: 'image' }
      }
    ]
  },
  spaceWithoutReadmeAndImage: {
    id: 1,
    name: 'space',
    special: []
  }
}

describe('Spaces project view', () => {
  it('should not show anything if space can not be found', async () => {
    mockAxios.request.mockImplementationOnce(() => {
      return Promise.resolve({
        data: spaceMocks.noSpace
      })
    })

    const wrapper = getMountedWrapper()
    await wrapper.vm.loadResourcesTask.last

    expect(wrapper.find(selectors.noSpace).exists()).toBeTruthy()
  })

  describe('space image', () => {
    it('should show if given', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: spaceMocks.spaceWithReadmeAndImage
        })
      })

      const wrapper = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last

      expect(wrapper.find(selectors.spaceImage).exists()).toBeTruthy()
      expect(wrapper.vm.imageContent).not.toBeUndefined()
      expect(wrapper).toMatchSnapshot()
    })
    it('should not show if not given', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: spaceMocks.spaceWithoutReadmeAndImage
        })
      })

      const wrapper = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last

      expect(wrapper.find(selectors.spaceImage).exists()).toBeFalsy()
      expect(wrapper.vm.imageContent).toEqual('')
    })

    it('should not show within a resource', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: spaceMocks.spaceWithReadmeAndImage
        })
      })

      const wrapper = getMountedWrapper([], { id: 1 })
      await wrapper.vm.loadResourcesTask.last

      expect(wrapper.find(selectors.spaceImage).exists()).toBeFalsy()
    })
  })

  describe('space readme', () => {
    it('should show if given', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: spaceMocks.spaceWithReadmeAndImage
        })
      })

      const wrapper = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last

      expect(wrapper.find(selectors.markdownContainer).exists()).toBeTruthy()
      expect(wrapper.vm.markdownContent).not.toBeUndefined()
      expect(wrapper).toMatchSnapshot()
    })
    it('should not show if not given', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: spaceMocks.spaceWithoutReadmeAndImage
        })
      })

      const wrapper = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last

      expect(wrapper.vm.markdownContent).toEqual('')
    })
  })

  describe('resources', () => {
    it('should show empty-message if no resources given', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: spaceMocks.spaceWithReadmeAndImage
        })
      })

      const wrapper = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last

      expect(wrapper.find(selectors.emptySpace).exists()).toBeTruthy()
    })
    it('should show resources if given', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: spaceMocks.spaceWithReadmeAndImage
        })
      })

      const spaceResource = buildResource(Files['/'][0])
      spaceResource.path = '/'

      const wrapper = getMountedWrapper([spaceResource])
      await wrapper.vm.loadResourcesTask.last

      expect(wrapper.find(selectors.emptySpace).exists()).toBeFalsy()
      expect(wrapper.vm.paginatedResources.length).toEqual(1)
    })
  })
})

function getMountedWrapper(spaceResources = [], spaceItem = null) {
  const $route = { params: { page: 1, item: spaceItem }, meta: { title: 'Space' } }
  const $router = {
    afterEach: jest.fn(),
    currentRoute: {
      name: 'space',
      query: {},
      params: { spaceId: 1 }
    },
    resolve: (r) => {
      return { href: r.name }
    }
  }

  return shallowMount(SpaceProject, {
    localVue,
    stubs: {
      RouterLink: RouterLinkStub
    },
    mocks: {
      $route,
      $router,
      $client: {
        files: {
          getFileContents: jest.fn(() => 'fileContent'),
          list: jest.fn(() => spaceResources)
        }
      }
    },

    store: createStore(Vuex.Store, {
      getters: {
        configuration: () => ({
          server: 'https://example.com/',
          options: {
            disablePreviews: true
          }
        })
      },
      modules: {
        Files: {
          namespaced: true,
          mutations: {
            CLEAR_CURRENT_FILES_LIST: jest.fn(),
            CLEAR_FILES_SEARCHED: jest.fn(),
            LOAD_FILES: jest.fn()
          },
          actions: {
            loadIndicators: jest.fn()
          },
          getters: {
            activeFiles: () => spaceResources,
            totalFilesCount: () => ({ files: spaceResources.length, folders: 0 }),
            selectedFiles: () => [],
            totalFilesSize: () => 10,
            pages: () => 1
          }
        }
      }
    })
  })
}
