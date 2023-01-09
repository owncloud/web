import { getCurrentInstance } from 'vue'

export const useService = <T>(name: string): T => {
  return (
    (getCurrentInstance().proxy as any)[name] || (getCurrentInstance().parent.proxy as any)[name]
  )
}
