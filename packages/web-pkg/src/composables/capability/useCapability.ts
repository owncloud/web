import { Store } from 'vuex'
import get from 'lodash-es/get'
import { computed, ComputedRef } from '@vue/composition-api'
import { useStore } from 'web-pkg/src/composables'

export const useCapability = <T>(
  store: Store<any>,
  name: string,
  defaultValue?: T
): ComputedRef<T> => {
  return computed((): T => {
    const value = get(store, `getters.capabilities.${name}`, defaultValue) as T
    if (value === undefined) {
      throw new Error('useCapability: capability is not defined and no default was provided')
    }
    return value
  })
}

const createCapabilityComposable = <T>(
  name: string,
  defaultValue?: T
): ((store?: Store<any>) => ComputedRef<T>) => {
  return (store?: Store<any>) => useCapability<T>(store || useStore(), name, defaultValue)
}

export const useCapabilityFilesSharingResharing = createCapabilityComposable(
  'files_sharing.resharing',
  true
)

export const useCapabilitySpacesEnabled = createCapabilityComposable('spaces.enabled', false)
export const useCapabilityFilesTusSupportHttpMethodOverride = createCapabilityComposable<boolean>(
  'files.tus_support.http_method_override',
  false
)
export const useCapabilityFilesTusSupportMaxChunkSize = createCapabilityComposable<number>(
  'files.tus_support.max_chunk_size',
  0
)
