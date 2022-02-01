import { ref, watch, unref } from '@vue/composition-api'

export const useLocalStorage = (key: string, defaultValue: any = undefined): any => {
  const existingValue = localStorage.getItem(key)
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
        localStorage.setItem(key, JSON.stringify(val))
      } else {
        localStorage.removeItem(key)
      }
    },
    { deep: true }
  )
  return variable
}
