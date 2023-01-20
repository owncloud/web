import FilesDrop from '../../../src/views/FilesDrop.vue'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs,
  RouteLocation
} from 'web-test-helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg'

describe('FilesDrop view', () => {
  it('drop container always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('#files-drop-container').exists()).toBeTruthy()
  })
  describe('different files view states', () => {
    it('shows the loading spinner during loading', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('oc-spinner-stub').exists()).toBeTruthy()
    })
    it('shows the "resource-upload"-component after loading', async () => {
      const { wrapper } = getMountedWrapper()
      wrapper.vm.loading = false
      await wrapper.vm.$nextTick()
      expect(wrapper.find('oc-spinner-stub').exists()).toBeFalsy()
      expect(wrapper.find('resource-upload-stub').exists()).toBeTruthy()
    })
  })
})

function getMountedWrapper() {
  const $clientService = mockDeep<ClientService>()
  $clientService.owncloudSdk.publicFiles.list.mockImplementation(() =>
    Promise.resolve([{ getProperty: jest.fn() }])
  )
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-common-favorites' })
    }),
    $clientService: $clientService
  }

  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(FilesDrop, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultMocks,
        stubs: defaultStubs
      }
    })
  }
}
