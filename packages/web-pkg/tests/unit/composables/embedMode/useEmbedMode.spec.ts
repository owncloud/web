import { useEmbedMode } from '../../../../src/composables/embedMode'
import { defaultComponentMocks, getComposableWrapper } from '@ownclouders/web-test-helpers'
import { unref } from 'vue'

describe('useEmbedMode', () => {
  describe('isEnabled', () => {
    it('when embed mode is disabled should return false', () => {
      getComposableWrapper(
        () => {
          const { isEnabled } = useEmbedMode()

          expect(unref(isEnabled)).toStrictEqual(false)
        },
        getWrapperOptions({ enabled: false })
      )
    })

    it('when embed mode is enabled should return true', () => {
      getComposableWrapper(
        () => {
          const { isEnabled } = useEmbedMode()

          expect(unref(isEnabled)).toStrictEqual(true)
        },
        getWrapperOptions({ enabled: true })
      )
    })
  })

  describe('isLocationPicker', () => {
    it('when target is not location should return false', () => {
      getComposableWrapper(
        () => {
          const { isLocationPicker } = useEmbedMode()

          expect(unref(isLocationPicker)).toStrictEqual(false)
        },
        getWrapperOptions({ target: 'resources' })
      )
    })

    it('when target is location should return true', () => {
      getComposableWrapper(
        () => {
          const { isLocationPicker } = useEmbedMode()

          expect(unref(isLocationPicker)).toStrictEqual(true)
        },
        getWrapperOptions({ target: 'location' })
      )
    })
  })

  describe('isFilePicker', () => {
    it('when target is not file should return false', () => {
      getComposableWrapper(
        () => {
          const { isFilePicker } = useEmbedMode()

          expect(unref(isFilePicker)).toStrictEqual(false)
        },
        getWrapperOptions({ target: 'resources' })
      )
    })

    it('when target is file should return true', () => {
      getComposableWrapper(
        () => {
          const { isFilePicker } = useEmbedMode()

          expect(unref(isFilePicker)).toStrictEqual(true)
        },
        getWrapperOptions({ target: 'file' })
      )
    })
  })

  describe('messagesTargetOrigin', () => {
    it('when messagesOrigin is set should return it', () => {
      getComposableWrapper(
        () => {
          const { messagesTargetOrigin } = useEmbedMode()

          expect(unref(messagesTargetOrigin)).toStrictEqual('message-origin')
        },
        getWrapperOptions({ messagesOrigin: 'message-origin' })
      )
    })
  })

  describe('isDelegatingAuthentication', () => {
    it('when delegation is enabled but embed mode is not enabled should return false', () => {
      getComposableWrapper(
        () => {
          const { isDelegatingAuthentication } = useEmbedMode()

          expect(unref(isDelegatingAuthentication)).toStrictEqual(false)
        },
        getWrapperOptions({ enabled: false, delegateAuthentication: true })
      )
    })

    it('when delegation is enabled and embed mode is enabled should return true', () => {
      getComposableWrapper(
        () => {
          const { isDelegatingAuthentication } = useEmbedMode()

          expect(unref(isDelegatingAuthentication)).toStrictEqual(true)
        },
        getWrapperOptions({ enabled: true, delegateAuthentication: true })
      )
    })

    it('when delegation is disabled and embed mode is enabled should return false', () => {
      getComposableWrapper(
        () => {
          const { isDelegatingAuthentication } = useEmbedMode()

          expect(unref(isDelegatingAuthentication)).toStrictEqual(false)
        },
        getWrapperOptions({ enabled: false, delegateAuthentication: false })
      )
    })
  })

  describe('postMessage', () => {
    it('when targetOrigin is not set should call postMessage without any origin', () => {
      window.parent.postMessage = vi.fn() as (...args: unknown[]) => unknown

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
        getWrapperOptions({ messagesOrigin: undefined })
      )
    })

    it('when targetOrigin is set should call postMessage with its value as origin', () => {
      window.parent.postMessage = vi.fn() as (...args: unknown[]) => unknown

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
        getWrapperOptions({ messagesOrigin: 'messages-origin' })
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
          const { verifyDelegatedAuthenticationOrigin } = useEmbedMode()

          expect(verifyDelegatedAuthenticationOrigin('event-origin')).toStrictEqual(true)
        },
        getWrapperOptions({ messagesOrigin: 'event-origin' })
      )
    })

    it('when delegateAuthenticationOrigin is set but origins do not match should return false', () => {
      getComposableWrapper(
        () => {
          const { verifyDelegatedAuthenticationOrigin } = useEmbedMode()

          expect(verifyDelegatedAuthenticationOrigin('event-origin')).toStrictEqual(false)
        },
        getWrapperOptions({ delegateAuthenticationOrigin: 'authentication-origin' })
      )
    })
  })
})

const getWrapperOptions = (embed = {}) => ({
  mocks: defaultComponentMocks(),
  pluginOptions: {
    piniaOptions: {
      configState: { options: { embed } }
    }
  }
})
