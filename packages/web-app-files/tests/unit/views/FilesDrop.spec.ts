import FilesDrop from '../../../src/views/FilesDrop.vue'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs
} from 'web-test-helpers'

describe('FilesDrop view', () => {
  it('drop container always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('#files-drop-container').exists()).toBeTruthy()
  })
  describe('different files view states', () => {
    it('shows the loading spinner during loading', () => {
      const { wrapper } = getMountedWrapper({ loading: true })
      expect(wrapper.find('oc-spinner-stub').exists()).toBeTruthy()
    })
    it('shows the "resource-upload"-component after loading', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('oc-spinner-stub').exists()).toBeFalsy()
      expect(wrapper.find('resource-upload-stub').exists()).toBeTruthy()
    })
  })
})

function getMountedWrapper({ mocks = {}, loading = false } = {}) {
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: { name: 'files-common-favorites' }
    }),
    $client: {
      publicFiles: { list: jest.fn(() => Promise.resolve([{ getProperty: jest.fn() }])) }
    },
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(FilesDrop, {
      data: () => ({
        loading
      }),
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultMocks,
        stubs: defaultStubs
      }
    })
  }
}
