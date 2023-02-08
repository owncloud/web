import resetLogo from '../../../src/mixins/general/resetLogo'
import { mock, mockDeep } from 'jest-mock-extended'
import { clientService } from 'web-pkg'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  RouteLocation,
  mockAxiosResolve,
  mockAxiosReject
} from 'web-test-helpers'

jest.useFakeTimers()

const Component = {
  template: '<div></div>',
  mixins: [resetLogo]
}

describe('resetLogo', () => {
  describe('method "$_resetLogo_reset"', () => {
    it('should show message on request success', async () => {
      const httpClientMock = mockDeep<any>({
        delete: jest.fn().mockResolvedValue(() => mockAxiosResolve())
      })
      jest.spyOn(clientService, 'httpAuthenticated').mockImplementation(() => httpClientMock)
      const { wrapper } = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_resetLogo_reset()
      jest.runAllTimers()
      expect(wrapper.vm.$router.go).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on request error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const httpClientMock = mockDeep<any>({
        delete: jest.fn().mockRejectedValue(() => mockAxiosReject())
      })
      jest.spyOn(clientService, 'httpAuthenticated').mockImplementation(() => httpClientMock)
      const { wrapper } = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_resetLogo_reset()
      jest.runAllTimers()
      expect(wrapper.vm.$router.go).toHaveBeenCalledTimes(0)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper() {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      global: {
        mocks: defaultComponentMocks({
          currentRoute: mock<RouteLocation>({ name: 'admin-settings-general' })
        }),
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
