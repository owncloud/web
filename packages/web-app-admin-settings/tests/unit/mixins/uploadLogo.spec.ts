import uploadLogo from '../../../src/mixins/general/uploadLogo'
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
  mixins: [uploadLogo]
}

describe('uploadImage', () => {
  describe('method "$_uploadLogo_upload"', () => {
    it('should show message on request success', async () => {
      const httpClientMock = mockDeep<any>({
        post: jest.fn().mockResolvedValue(() => mockAxiosResolve())
      })
      jest.spyOn(clientService, 'httpAuthenticated').mockImplementation(() => httpClientMock)
      const { wrapper } = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_uploadLogo_upload({
        currentTarget: {
          files: [{ name: 'image.png', type: 'image/png' }]
        }
      })
      jest.runAllTimers()
      expect(wrapper.vm.$router.go).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on request error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const httpClientMock = mockDeep<any>({
        post: jest.fn().mockRejectedValue(() => mockAxiosReject())
      })
      jest.spyOn(clientService, 'httpAuthenticated').mockImplementation(() => httpClientMock)
      const { wrapper } = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_uploadLogo_upload({
        currentTarget: {
          files: [{ name: 'image.png', type: 'image/png' }]
        }
      })
      jest.runAllTimers()
      expect(wrapper.vm.$router.go).toHaveBeenCalledTimes(0)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on invalid mimeType', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_uploadLogo_upload({
        currentTarget: {
          files: [{ name: 'text.txt', type: 'text/plain' }]
        }
      })
      expect(clientService.httpAuthenticated).toHaveBeenCalledTimes(0)
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
