import { computed, unref } from 'vue'
import { useConfigurationManager } from '../configuration'

export const useEmbedMode = () => {
  const configuration = useConfigurationManager()

  const isEnabled = computed(() => configuration.options.embed?.enabled)

  const isLocationPicker = computed(() => {
    return configuration.options.embed?.target === 'location'
  })

  const messagesTargetOrigin = computed(() => configuration.options.embed?.messagesOrigin)

  const isDelegatingAuthentication = computed(
    () => unref(isEnabled) && configuration.options.embed.delegateAuthentication
  )

  const delegateAuthenticationOrigin = computed(
    () => configuration.options.embed.delegateAuthenticationOrigin
  )

  const postMessage = <Payload>(name: string, data?: Payload): void => {
    const options: WindowPostMessageOptions = {}

    if (unref(messagesTargetOrigin)) {
      options.targetOrigin = unref(messagesTargetOrigin)
    }

    window.parent.postMessage({ name, data }, options)
  }

  const verifyDelegatedAuthenticationOrigin = (eventOrigin: string): boolean => {
    if (!unref(delegateAuthenticationOrigin)) {
      return true
    }

    return unref(delegateAuthenticationOrigin) === eventOrigin
  }

  return {
    isEnabled,
    isLocationPicker,
    messagesTargetOrigin,
    isDelegatingAuthentication,
    postMessage,
    verifyDelegatedAuthenticationOrigin
  }
}
