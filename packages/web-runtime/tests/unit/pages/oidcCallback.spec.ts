import {
  RouteLocation,
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import oidcCallback from '../../../src/pages/oidcCallback.vue'
import { authService } from 'web-runtime/src/services/auth'
import { mock } from 'jest-mock-extended'
import { computed } from 'vue'
import { createMockThemeStore } from 'web-test-helpers/src/mocks/pinia'

const mockUseEmbedMode = jest.fn()

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useRoute: jest.fn().mockReturnValue({ query: {} }),
  useEmbedMode: jest.fn().mockImplementation(() => mockUseEmbedMode())
}))

const postMessageMock = jest.fn()
console.debug = jest.fn()

describe('oidcCallback page', () => {
  describe('delegated authentication', () => {
    it('when authentication is delegated does not call signInCallback immediately', () => {
      mockUseEmbedMode.mockReturnValue({
        isDelegatingAuthentication: computed(() => true),
        postMessage: postMessageMock,
        verifyDelegatedAuthenticationOrigin: jest.fn().mockReturnValue(true)
      })

      const signInCallbackSpy = jest
        .spyOn(authService, 'signInCallback')
        .mockImplementation(() => Promise.resolve())

      getWrapper()

      expect(signInCallbackSpy).not.toHaveBeenCalled()
    })

    it('when authentication is not delegated calls signInCallback immediately', () => {
      mockUseEmbedMode.mockReturnValue({
        isDelegatingAuthentication: computed(() => false),
        verifyDelegatedAuthenticationOrigin: jest.fn().mockReturnValue(true)
      })

      const signInCallbackSpy = jest
        .spyOn(authService, 'signInCallback')
        .mockImplementation(() => Promise.resolve())

      getWrapper()

      expect(signInCallbackSpy).toHaveBeenCalled()
    })

    it('when authentication is delegated calls postMessage with token request event', () => {
      mockUseEmbedMode.mockReturnValue({
        isDelegatingAuthentication: computed(() => true),
        postMessage: postMessageMock,
        verifyDelegatedAuthenticationOrigin: jest.fn().mockReturnValue(true)
      })

      jest.spyOn(authService, 'signInCallback').mockImplementation(() => Promise.resolve())

      getWrapper()

      expect(postMessageMock).toHaveBeenCalledWith('owncloud-embed:request-token')
    })

    it('when token update event is received calls signInCallback', async () => {
      mockUseEmbedMode.mockReturnValue({
        isDelegatingAuthentication: computed(() => true),
        postMessage: postMessageMock,
        verifyDelegatedAuthenticationOrigin: jest.fn().mockReturnValue(true)
      })

      const signInCallbackSpy = jest
        .spyOn(authService, 'signInCallback')
        .mockImplementation(() => Promise.resolve())

      getWrapper()

      window.postMessage(
        {
          name: 'owncloud-embed:update-token',
          data: { access_token: 'access-token' }
        },
        '*'
      )

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10))

      expect(signInCallbackSpy).toHaveBeenCalledWith('access-token')
    })

    it('when token update event is received but name is incorrect does not call signInCallback', async () => {
      mockUseEmbedMode.mockReturnValue({
        isDelegatingAuthentication: computed(() => true),
        postMessage: postMessageMock,
        verifyDelegatedAuthenticationOrigin: jest.fn().mockReturnValue(true)
      })

      const signInCallbackSpy = jest
        .spyOn(authService, 'signInCallback')
        .mockImplementation(() => Promise.resolve())

      getWrapper()

      window.postMessage(
        {
          name: 'update-token',
          data: { access_token: 'access-token' }
        },
        '*'
      )

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10))

      expect(signInCallbackSpy).not.toHaveBeenCalled()
    })
  })
})

function getWrapper() {
  const storeOptions = { ...defaultStoreMockOptions }

  storeOptions.getters.configuration.mockReturnValue({
    server: 'http://server/address/'
  })

  const store = createStore(storeOptions)

  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ query: {} })
    })
  }

  return {
    storeOptions,
    wrapper: shallowMount(oidcCallback, {
      global: {
        plugins: [...defaultPlugins(), store, createMockThemeStore()],
        mocks,
        provide: {}
      }
    })
  }
}
