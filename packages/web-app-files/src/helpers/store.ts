/**
 * Takes an object from state and creates a copy of it with only the values (no watchers, etc.)
 * Editing the copied object does not result in errors due to modifying the state.
 * The copied object is still reactive.
 * @param {Object} state Object in the state to be copied
 * @return {Object} Copied object
 */
import {
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  ComponentInstance
} from '@vue/composition-api'

export function cloneStateObject(state: any): any {
  return JSON.parse(JSON.stringify(state))
}

export const useMutationObserver = (
  mutations: string[],
  callback: ({
    componentInstance,
    payload
  }: {
    componentInstance: ComponentInstance
    payload: any
  }) => void
): void => {
  const { proxy: componentInstance } = getCurrentInstance()
  onMounted(() => {
    const subscription = componentInstance.$store.subscribe((mutation) => {
      if (!mutations.includes(mutation.type)) {
        return
      }

      callback({ componentInstance, payload: mutation.payload })
    })

    onBeforeUnmount(subscription)
  })
}
