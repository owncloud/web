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
          value: [
            { driveType: 'project', id: '1' },
            { driveType: 'personal', id: '2' }
          ]
        }
      })
    })

    const wrapper = getMountedWrapper()
    await wrapper.vm.loadSpacesTask.last

    expect(wrapper.vm.spaces.length).toEqual(1)
    expect(wrapper).toMatchSnapshot()
  })

  it('should show the "create new space" modal with sufficient permissions', async () => {
    mockAxios.request.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          value: []
        }
      })
    })
    const wrapper = getMountedWrapper()
    await wrapper.vm.loadSpacesTask.last

    const createModalStub = jest.spyOn(wrapper.vm, 'createModal')
    const button = wrapper.find('[data-testid="spaces-list-create-space-btn"]')
    expect(button.exists()).toBeTruthy()
    await button.trigger('click')

    expect(createModalStub).toHaveBeenCalledTimes(1)
  })

  it('should show an error message when trying to create a space with an empty name', async () => {
    mockAxios.request.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          value: []
        }
      })
    })
    const wrapper = getMountedWrapper()
    await wrapper.vm.loadSpacesTask.last

    const spyInputErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
    wrapper.vm.checkSpaceName('')

    expect(spyInputErrorMessageStub).toHaveBeenCalledTimes(1)
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
      },
      actions: {
        createModal: jest.fn()
      }
    })
  })
}
