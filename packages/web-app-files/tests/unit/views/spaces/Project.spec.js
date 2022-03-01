import GetTextPlugin from 'vue-gettext'
import { RouterLinkStub, shallowMount } from '@vue/test-utils'
import { localVue } from '../views.setup'
import { createStore } from 'vuex-extensions'
import Files from '@/__fixtures__/files'
import mockAxios from 'jest-mock-axios'
import SpaceProject from '../../../../src/views/spaces/Project.vue'
import Vuex from 'vuex'

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

beforeEach(mockAxios.reset)

afterEach(() => {
  jest.unmock('@files/src/composables/index')
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

      const wrapper = getMountedWrapper(
        [],
        null,
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII='
      )
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

      const wrapper = getMountedWrapper([Files['/'][0]])
      await wrapper.vm.loadResourcesTask.last

      expect(wrapper.find(selectors.emptySpace).exists()).toBeFalsy()
      expect(wrapper.vm.paginatedResources.length).toEqual(1)
    })
  })
})

function getMountedWrapper(spaceResources = [], spaceItem = null, imageContent = '') {
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
    data: () => {
      return {
        imageContent
      }
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
