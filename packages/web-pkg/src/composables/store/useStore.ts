import { Store } from 'vuex'
import { useService } from '../service'

export const useStore = <T = any>(): Store<T> => {
  return useService('$store')
}
