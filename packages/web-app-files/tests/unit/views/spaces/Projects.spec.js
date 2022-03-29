import { mount } from '@vue/test-utils'
import { localVue } from '../views.setup'
import { createStore } from 'vuex-extensions'
import mockAxios from 'jest-mock-axios'
import SpaceProjects from '../../../../src/views/spaces/Projects.vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import { buildSpace } from '../../../../src/helpers/resources'

localVue.use(VueRouter)

const selectors = {
  sharesNoContentMessage: '#files-spaces-empty',
  spacesList: '.spaces-list'
}

beforeEach(mockAxios.reset)

describe('Spaces projects view', () => {
  it('should show a "no content" message', async () => {
    mockAxios.request.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          value: []
        }
      })
    })

    const wrapper = getMountedWrapper()
    await wrapper.vm.loadResourcesTask.last

    expect(wrapper.find(selectors.sharesNoContentMessage).exists()).toBeTruthy()
  })

  it('should list spaces', async () => {
    const drives = [buildSpace({ driveType: 'project', id: '1' })]

    mockAxios.request.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          value: drives
        }
      })
    })

    const wrapper = getMountedWrapper(drives)
    await wrapper.vm.loadResourcesTask.last

    expect(wrapper.vm.spaces.length).toEqual(1)
    expect(wrapper).toMatchSnapshot()
  })
})

function getMountedWrapper(activeFiles = []) {
  const routes = [
    {
      name: 'files-spaces-project',
      path: '/'
    }
  ]
  return mount(SpaceProjects, {
    localVue,
    router: new VueRouter({ routes }),
    store: createStore(Vuex.Store, {
      getters: {
        configuration: () => ({
          server: 'https://example.com/'
        }),
        user: () => ({
          id: 'marie'
        })
      },
      modules: {
        Files: {
          namespaced: true,
          getters: {
            activeFiles: () => activeFiles
          },
          mutations: {
            SET_CURRENT_FOLDER: jest.fn(),
            CLEAR_CURRENT_FILES_LIST: jest.fn(),
            CLEAR_FILES_SEARCHED: jest.fn(),
            LOAD_FILES: jest.fn()
          }
        }
      }
    }),
    stubs: {
      'app-bar': true,
      translate: true
    }
  })
}
