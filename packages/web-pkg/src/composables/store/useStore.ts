import { getCurrentInstance } from 'vue'
import { Store } from 'vuex'

export const useStore = <T = any>(): Store<T> => {
  return (getCurrentInstance().proxy as any).$store
}
