import { getCurrentInstance } from '@vue/composition-api'

// FIXME: use proper types
export const useClient = <T = any>(): T => {
  return ((getCurrentInstance().proxy as unknown) as any).$client
}
