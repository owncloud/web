import { getCurrentInstance } from '@vue/composition-api'
import { Store } from 'vuex'

export const useStore = <T = any>(): Store<T> => {
  return getCurrentInstance().proxy.$store
}
