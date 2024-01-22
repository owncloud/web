import { computed, ComputedRef, unref } from 'vue'
import { queryItemAsString } from '../appDefaults'
import { useRouteQueryPersisted } from '../router'
import { FolderViewModeConstants } from './constants'

export function useViewMode(options: ComputedRef<string>): ComputedRef<string> {
  if (options) {
    return computed(() => unref(options))
  }

  const viewModeQuery = useRouteQueryPersisted({
    name: FolderViewModeConstants.queryName,
    defaultValue: FolderViewModeConstants.defaultModeName
  })
  return computed(() => queryItemAsString(unref(viewModeQuery)))
}

export function useViewSize(options: ComputedRef<string>): ComputedRef<number> {
  if (options) {
    return computed(() => parseInt(unref(options)))
  }

  const viewModeSize = useRouteQueryPersisted({
    name: FolderViewModeConstants.tilesSizeQueryName,
    defaultValue: FolderViewModeConstants.tilesSizeDefault.toString()
  })
  return computed(() => parseInt(queryItemAsString(unref(viewModeSize))))
}
