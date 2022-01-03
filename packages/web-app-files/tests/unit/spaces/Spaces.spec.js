import { mount } from '@vue/test-utils'
import { localVue } from '../views/views.setup'
import { createStore } from 'vuex-extensions'

import Spaces from '../../../src/spaces/views/Spaces.vue'

import VueRouter from 'vue-router'
import Vuex from 'vuex'
import mockAxios from 'jest-mock-axios'

localVue.use(VueRouter)

const selectors = {
  sharesNoContentMessage: '#files-spaces-empty',
  spacesList: '.spaces-list'
}

const spacesDefaultImg = 'spaces.svg'

beforeEach(mockAxios.reset)

describe('Spaces component', () => {
  it('sets a default image for spaces', () => {
    const wrapper = getMountedWrapper()
    expect(wrapper.vm.defaultImg).toEqual(spacesDefaultImg)
  })
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
  return mount(Spaces, {
    localVue,
    router: new VueRouter(),
    store: createStore(Vuex.Store, {
      getters: {
        configuration: jest.fn(() => ({
          server: 'https://example.com/',
          theme: {
            spaces: {
              defaultImg: spacesDefaultImg
            }
          }
        }))
      }
    })
  })
}
