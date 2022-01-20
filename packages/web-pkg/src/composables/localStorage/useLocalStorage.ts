import { ref, watch } from '@vue/composition-api'

export const useLocalStorage = (key: string, defaultValue: any = undefined): any => {
  const existingValue = localStorage.getItem(key)
  const variable = ref(existingValue ? JSON.parse(existingValue) : defaultValue)

  watch(
    () => variable.value,
    (val, old) => {
      if (val === old) {
        return
      }
      if (val) {
        localStorage.setItem(key, JSON.stringify(val))
      } else {
        localStorage.removeItem(key)
      }
    },
    { deep: true }
  )
  return variable
}
