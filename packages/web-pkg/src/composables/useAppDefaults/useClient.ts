import { getCurrentInstance } from '@vue/composition-api'

// FIXME: use proper type
export type Client = any

export const useClient = (): Client => {
  return (getCurrentInstance().proxy as unknown as any).$client
}
