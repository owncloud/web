import { computed } from 'vue'
import { useStore } from '../store'

export const useEmbedMode = () => {
  const store = useStore()

  const isEnabled = computed<boolean>(() => store.getters.configuration.options.embed?.enabled)

  const isLocationPicker = computed<boolean>(() => {
    return store.getters.configuration.options.embed?.target === 'location'
  })

  const messagesTargetOrigin = computed<string>(
    () => store.getters.configuration.options.embed?.messagesOrigin
  )

  const postMessage = <Payload>(name: string, data?: Payload): void => {
    const options: WindowPostMessageOptions = {}

    if (messagesTargetOrigin.value) {
      options.targetOrigin = messagesTargetOrigin.value
    }

    window.parent.postMessage({ name, data }, options)
  }

  return { isEnabled, isLocationPicker, messagesTargetOrigin, postMessage }
}
