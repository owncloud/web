import { computed, ComputedRef, unref } from 'vue'
import { queryItemAsString, useRouteQueryPersisted } from 'web-pkg/src/composables'
import { ViewModeConstants } from './constants'

export function useViewMode<T>(options: ComputedRef<string>): ComputedRef<string> {
  if (options) {
    return computed(() => unref(options))
  }

  const viewModeQuery = useRouteQueryPersisted({
    name: ViewModeConstants.queryName,
    defaultValue: ViewModeConstants.default
  })
  return computed(() => queryItemAsString(unref(viewModeQuery)))
}
