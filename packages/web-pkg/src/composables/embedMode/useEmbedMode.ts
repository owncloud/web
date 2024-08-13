import { computed, unref } from 'vue'
import { useConfigStore } from '../piniaStores'
import { Resource } from '@ownclouders/web-client'
import { RouteLocation } from 'vue-router'

export interface embedModeFilePickMessageData {
  resource: Resource
  originRoute: RouteLocation
}

export const useEmbedMode = () => {
  const configStore = useConfigStore()

  const isEnabled = computed(() => configStore.options.embed?.enabled)

  const isLocationPicker = computed(() => {
    return configStore.options.embed?.target === 'location'
  })

  const isFilePicker = computed(() => {
    return configStore.options.embed?.target === 'file'
  })

  const fileTypes = computed(() => {
    return configStore.options.embed?.fileTypes
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
    fileTypes,
    postMessage,
    verifyDelegatedAuthenticationOrigin
  }
}
