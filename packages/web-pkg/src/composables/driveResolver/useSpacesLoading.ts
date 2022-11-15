import { computed } from 'vue'
import { Store } from 'vuex'
import { useStore } from '../store'

export interface SpacesLoadingOptions {
  store?: Store<any>
}

export const useSpacesLoading = (options: SpacesLoadingOptions) => {
  const store = options?.store || useStore()
  const areSpacesLoading = computed(
    () =>
      !store.getters['runtime/spaces/spacesInitialized'] ||
      store.getters['runtime/spaces/spacesLoading']
  )
  return {
    areSpacesLoading
  }
}
