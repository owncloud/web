import QuotaModal from 'web-app-files/src/components/Spaces/QuotaModal.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  mount,
  mockAxiosResolve
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg'
import { Graph } from 'web-client'

afterEach(() => jest.clearAllMocks())

describe('QuotaModal', () => {
  describe('method "editQuota"', () => {
    it('should show message on success', async () => {
      const graphMock = mockDeep<Graph>()
      graphMock.drives.updateDrive.mockImplementation(() =>
        mockAxiosResolve({
          id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
          name: 'any',
          quota: {
            remaining: 9999999836,
            state: 'normal',
            total: 10000000000,
            used: 164
          }
        })
      )

      const { wrapper } = getWrapper(graphMock)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const updateSpaceFieldStub = jest.spyOn(wrapper.vm, 'UPDATE_SPACE_FIELD')
      await wrapper.vm.editQuota()

      expect(updateSpaceFieldStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on server error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graphMock = mockDeep<Graph>()
      graphMock.drives.updateDrive.mockRejectedValue(new Error())

      const { wrapper } = getWrapper(graphMock)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const updateSpaceFieldStub = jest.spyOn(wrapper.vm, 'UPDATE_SPACE_FIELD')
      await wrapper.vm.editQuota()

      expect(updateSpaceFieldStub).toHaveBeenCalledTimes(0)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(graphMock) {
  const storeOptions = defaultStoreMockOptions
  const $clientService = mockDeep<ClientService>({ graphAuthenticated: () => graphMock })

  const store = createStore(storeOptions)
  return {
    wrapper: mount(QuotaModal, {
      data: () => {
        return {
          selectedOption: {
            displayValue: '10',
            displayUnit: 'GB',
            value: 10 * Math.pow(10, 9)
          }
        }
      },
      props: {
        cancel: jest.fn(),
        space: {
          id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
          spaceQuota: {
            remaining: 9999999836,
            state: 'normal',
            total: 10000000000,
            used: 164
          }
        }
      },
      global: {
        stubs: { ...defaultStubs, portal: true, 'oc-modal': true },
        mocks: { ...defaultComponentMocks(), $clientService },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
