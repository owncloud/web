import { getCurrentInstance } from '@vue/composition-api'

export const useCurrentLanguage = () => {
  const p = getCurrentInstance().proxy as any
  return p.$language.current
}
