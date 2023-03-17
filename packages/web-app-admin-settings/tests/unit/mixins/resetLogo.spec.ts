import resetLogo from '../../../src/mixins/general/resetLogo'
import { mock } from 'jest-mock-extended'
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
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.httpAuthenticated.delete.mockResolvedValue(() => mockAxiosResolve())
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_resetLogo_reset()
      jest.runAllTimers()
      expect(wrapper.vm.$router.go).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on request error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.httpAuthenticated.delete.mockRejectedValue(() => mockAxiosReject())
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
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'admin-settings-general' })
  })
  return {
    mocks,
    wrapper: mount(Component, {
      global: {
        mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
