import { configurationManager, useEmbedMode } from '../../../../src'
import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { unref } from 'vue'

describe('useEmbedMode', () => {
  describe('isEnabled', () => {
    it('when embed mode is disabled should return false', () => {
      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: false } }
      })

      getComposableWrapper(
        () => {
          const { isEnabled } = useEmbedMode()

          expect(unref(isEnabled)).toStrictEqual(false)
        },
        { mocks: defaultComponentMocks() }
      )
    })

    it('when embed mode is enabled should return true', () => {
      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: true } }
      })

      getComposableWrapper(
        () => {
          const { isEnabled } = useEmbedMode()

          expect(unref(isEnabled)).toStrictEqual(true)
        },
        { mocks: defaultComponentMocks() }
      )
    })
  })

  describe('isLocationPicker', () => {
    it('when target is not location should return false', () => {
      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { target: 'resources' } }
      })

      getComposableWrapper(
        () => {
          const { isLocationPicker } = useEmbedMode()

          expect(unref(isLocationPicker)).toStrictEqual(false)
        },
        { mocks: defaultComponentMocks() }
      )
    })

    it('when target is location should return true', () => {
      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { target: 'location' } }
      })

      getComposableWrapper(
        () => {
          const { isLocationPicker } = useEmbedMode()

          expect(unref(isLocationPicker)).toStrictEqual(true)
        },
        { mocks: defaultComponentMocks() }
      )
    })
  })

  describe('messagesTargetOrigin', () => {
    it('when messagesOrigin is set should return it', () => {
      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { messagesOrigin: 'message-origin' } }
      })

      getComposableWrapper(
        () => {
          const { messagesTargetOrigin } = useEmbedMode()

          expect(unref(messagesTargetOrigin)).toStrictEqual('message-origin')
        },
        { mocks: defaultComponentMocks() }
      )
    })
  })

  describe('isDelegatingAuthentication', () => {
    it('when delegation is enabled but embed mode is not enabled should return false', () => {
      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: false, delegateAuthentication: true } }
      })

      getComposableWrapper(
        () => {
          const { isDelegatingAuthentication } = useEmbedMode()

          expect(unref(isDelegatingAuthentication)).toStrictEqual(false)
        },
        { mocks: defaultComponentMocks() }
      )
    })

    it('when delegation is enabled and embed mode is enabled should return true', () => {
      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: true, delegateAuthentication: true } }
      })

      getComposableWrapper(
        () => {
          const { isDelegatingAuthentication } = useEmbedMode()

          expect(unref(isDelegatingAuthentication)).toStrictEqual(true)
        },
        { mocks: defaultComponentMocks() }
      )
    })

    it('when delegation is disabled and embed mode is enabled should return false', () => {
      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: true, delegateAuthentication: false } }
      })

      getComposableWrapper(
        () => {
          const { isDelegatingAuthentication } = useEmbedMode()

          expect(unref(isDelegatingAuthentication)).toStrictEqual(false)
        },
        { mocks: defaultComponentMocks() }
      )
    })
  })

  describe('postMessage', () => {
    it('when targetOrigin is not set should call postMessage without any origin', () => {
      window.parent.postMessage = jest.fn()

      getComposableWrapper(
        () => {
          const { postMessage } = useEmbedMode()

          postMessage('owncloud-embed:request-token', { hello: 'world' })

          expect(window.parent.postMessage).toHaveBeenCalledWith(
            {
              name: 'owncloud-embed:request-token',
              data: { hello: 'world' }
            },
            {}
          )
        },
        { mocks: defaultComponentMocks() }
      )
    })

    it('when targetOrigin is set should call postMessage with its value as origin', () => {
      window.parent.postMessage = jest.fn()

      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { messagesOrigin: 'messages-origin' } }
      })

      getComposableWrapper(
        () => {
          const { postMessage } = useEmbedMode()

          postMessage('owncloud-embed:request-token', { hello: 'world' })

          expect(window.parent.postMessage).toHaveBeenCalledWith(
            {
              name: 'owncloud-embed:request-token',
              data: { hello: 'world' }
            },
            { targetOrigin: 'messages-origin' }
          )
        },
        { mocks: defaultComponentMocks() }
      )
    })
  })

  describe('verifyDelegatedAuthenticationOrigin', () => {
    it('when delegateAuthenticationOrigin is not set should return true', () => {
      getComposableWrapper(
        () => {
          const { verifyDelegatedAuthenticationOrigin } = useEmbedMode()

          expect(verifyDelegatedAuthenticationOrigin('event-origin')).toStrictEqual(true)
        },
        { mocks: defaultComponentMocks() }
      )
    })

    it('when delegateAuthenticationOrigin is set and origins match should return true', () => {
      getComposableWrapper(
        () => {
          configurationManager.initialize({
            server: 'http://server/address/',
            options: { embed: { delegateAuthenticationOrigin: 'event-origin' } }
          })

          const { verifyDelegatedAuthenticationOrigin } = useEmbedMode()

          expect(verifyDelegatedAuthenticationOrigin('event-origin')).toStrictEqual(true)
        },
        { mocks: defaultComponentMocks() }
      )
    })

    it('when delegateAuthenticationOrigin is set but origins do not match should return false', () => {
      getComposableWrapper(
        () => {
          configurationManager.initialize({
            server: 'http://server/address/',
            options: { embed: { delegateAuthenticationOrigin: 'authentication-origin' } }
          })

          const { verifyDelegatedAuthenticationOrigin } = useEmbedMode()

          expect(verifyDelegatedAuthenticationOrigin('event-origin')).toStrictEqual(false)
        },
        { mocks: defaultComponentMocks() }
      )
    })
  })
})
