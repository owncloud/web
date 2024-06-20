import { computed, unref } from 'vue'
import { useConfigStore } from '../piniaStores'

export const useEmbedMode = () => {
  const configStore = useConfigStore()

  const isEnabled = computed(() => configStore.options.embed?.enabled)

  const isLocationPicker = computed(() => {
    return configStore.options.embed?.target === 'location'
  })

  const isFilePicker = computed(() => {
    return configStore.options.embed?.target === 'file'
  })

  const extensions = computed(() => {
    return configStore.options.embed?.extensions
  })

  const messagesTargetOrigin = computed(() => configStore.options.embed?.messagesOrigin)

  const isDelegatingAuthentication = computed(
    () => unref(isEnabled) && configStore.options.embed?.delegateAuthentication
  )

  const delegateAuthenticationOrigin = computed(
    () => configStore.options.embed?.delegateAuthenticationOrigin
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
    isFilePicker,
    messagesTargetOrigin,
    isDelegatingAuthentication,
    extensions,
    postMessage,
    verifyDelegatedAuthenticationOrigin
  }
}
