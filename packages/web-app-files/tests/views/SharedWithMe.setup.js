import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import OwnCloud from 'owncloud-sdk'
import SharedWithMe from '../../src/views/SharedWithMe'
import { createStore } from 'vuex-extensions'
import DesignSystem from 'owncloud-design-system'

const createFile = ({ id, status = 1, type = 'folder' }) => ({
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

const localVue = createLocalVue()
localVue.prototype.$client = new OwnCloud()
localVue.prototype.$client.init({ baseUrl: 'http://none.de' })
localVue.use(Vuex)
localVue.use(DesignSystem)

export const store = createStore(Vuex.Store, {
  getters: {
    configuration: () => ({
      options: {
        disablePreviews: true
      }
    }),
    getToken: () => '',
    isOcis: () => true
  },
  modules: {
    Files: {
      state: {
        resource: null
      },
      getters: {
        selectedFiles: () => [],
        activeFiles: () => [createFile({ id: 1 }), createFile({ id: 2, status: 2 })],
        activeFilesCount: () => ({ files: 0, folders: 1 }),
        inProgress: () => [null],
        highlightedFile: () => null
      },
      mutations: {
        UPDATE_RESOURCE: (state, resource) => {
          state.resource = resource
        }
      },
      namespaced: true
    }
  }
})

export const wrapper = mount(
  { ...SharedWithMe, created: jest.fn(), mounted: jest.fn() },
  {
    localVue,
    store,
    stubs: {
      'router-link': true,
      translate: true
    },
    data: () => ({
      loading: false
    })
  }
)

jest.mock('../../src/helpers/resources', () => ({
  buildSharedResource: jest.fn(share => share)
}))

export const showMessage = jest.spyOn(wrapper.vm, 'showMessage').mockImplementation(v => v)
export const getShare = jest
  .spyOn(localVue.prototype.$client.shares, 'getShare')
  .mockImplementation(v => v)
