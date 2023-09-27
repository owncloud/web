import { computed, ComputedRef, unref } from 'vue'
import { queryItemAsString } from '@ownclouders/web-pkg'
import { useRouteQueryPersisted } from '@ownclouders/web-pkg'
import { ViewModeConstants } from './constants'

export function useViewMode(options: ComputedRef<string>): ComputedRef<string> {
  if (options) {
    return computed(() => unref(options))
  }

  const viewModeQuery = useRouteQueryPersisted({
    name: ViewModeConstants.queryName,
    defaultValue: ViewModeConstants.defaultModeName
  })
  return computed(() => queryItemAsString(unref(viewModeQuery)))
}

export function useViewSize<T>(options: ComputedRef<string>): ComputedRef<number> {
  if (options) {
    return computed(() => parseInt(unref(options)))
  }

  const viewModeSize = useRouteQueryPersisted({
    name: ViewModeConstants.tilesSizeQueryName,
    defaultValue: ViewModeConstants.tilesSizeDefault.toString()
  })
  return computed(() => parseInt(queryItemAsString(unref(viewModeSize))))
}
