import { customRef, Ref, ref } from '@vue/composition-api'
import debounce, { DebounceSettings } from 'lodash-es/debounce'

export const useDebouncedRef = <T>(
  initialValue: T,
  wait?: number,
  options?: DebounceSettings
): Ref<T> => {
  const state = ref(initialValue)
  return customRef((track, trigger) => ({
    get() {
      track()
      return state.value
    },
    set: debounce(
      (value) => {
        state.value = value
        trigger()
      },
      wait,
      options
    )
  }))
}
