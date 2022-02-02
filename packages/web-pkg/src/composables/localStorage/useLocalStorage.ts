import { ref, watch, unref } from '@vue/composition-api'

export const useLocalStorage = (key: string, defaultValue: any = undefined): any => {
  const existingValue = window.localStorage.getItem(key)
  const variable = ref(defaultValue)

  if (existingValue) {
    try {
      variable.value = JSON.parse(existingValue)
    } catch {
      variable.value = existingValue
    }
  }

  watch(
    () => unref(variable),
    (val, old) => {
      if (val === old) {
        return
      }
      if (val !== undefined) {
        window.localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val))
      } else {
        window.localStorage.removeItem(key)
      }
    },
    { deep: true }
  )
  return variable
}
