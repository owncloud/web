import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from 'tests/unit/stubs'
import BatchActions from '../../../../../src/components/AppBar/SelectedResources/BatchActions.vue'
const permissionsHelper = '../../../../../src/helpers/permissions'

jest.mock(permissionsHelper, () => ({
  ...jest.requireActual(permissionsHelper),
  canBeMoved: jest.fn(() => false)
}))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

const files = [
  {
    path: '/Folder'
  },
  {
    path: '/lorem.txt'
  }
]
const componentStubs = { ...stubs, translate: true }
const elSelector = {
  ocButtonStub: 'oc-button-stub'
}

describe('Batch Actions component', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it.todo('renders an empty list if there are no batch actions available')
  it.todo('renders a button for each available batch action')
})

function createShallowMountWrapper(options = {}) {
  return shallowMount(BatchActions, {
    localVue,
    stubs: componentStubs,
    ...options
  })
}

function createStore(state = { selected: [], currentFolder: {} }) {
  return new Vuex.Store({
    modules: {
      Files: {
        state: {
          currentFolder: { path: '' },
          ...state
        },
        namespaced: true,
        getters: {
          selectedFiles: () => state.selected,
          currentFolder: () => state.currentFolder,
          activeFilesCurrentPage: () => files
        }
      }
    }
  })
}
