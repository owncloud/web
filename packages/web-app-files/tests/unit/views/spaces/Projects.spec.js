import { mount } from '@vue/test-utils'
import { localVue } from '../views.setup'
import { createStore } from 'vuex-extensions'
import mockAxios from 'jest-mock-axios'
import SpaceProjects from '../../../../src/views/spaces/Projects.vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

localVue.use(VueRouter)

const selectors = {
  sharesNoContentMessage: '#files-spaces-empty',
  spacesList: '.spaces-list'
}

beforeEach(mockAxios.reset)

describe('Spaces component', () => {
  it('should show a "no content" message', async () => {
    mockAxios.request.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          value: []
        }
      })
    })

    const wrapper = getMountedWrapper()
    await wrapper.vm.loadSpacesTask.last

    expect(wrapper.find(selectors.sharesNoContentMessage).exists()).toBeTruthy()
  })

  it('should only list drives of type "project"', async () => {
    mockAxios.request.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          value: [{ driveType: 'project' }, { driveType: 'personal' }]
        }
      })
    })

    const wrapper = getMountedWrapper()
    await wrapper.vm.loadSpacesTask.last

    expect(wrapper.vm.spaces.length).toEqual(1)
  })
})

function getMountedWrapper() {
  return mount(SpaceProjects, {
    localVue,
    router: new VueRouter(),
    store: createStore(Vuex.Store, {
      getters: {
        configuration: () => ({
          server: 'https://example.com/'
        })
      }
    })
  })
}
