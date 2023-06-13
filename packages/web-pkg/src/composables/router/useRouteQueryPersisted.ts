import { Ref, watch, unref } from 'vue'
import { useLocalStorage, useRouteQuery } from 'web-pkg'
import { QueryValue } from './types'

export interface RouteQueryPersistedOptions {
  name: string
  defaultValue: QueryValue
  storagePrefix?: string
}

interface WatcherValue {
  value: QueryValue
  source: string
}

export const useRouteQueryPersisted = (options: RouteQueryPersistedOptions): Ref<QueryValue> => {
  const routeQueryVariable = useRouteQuery(options.name)
  const localStorageVariable = useLocalStorage(localStorageKey(options))
  watch(
    (): WatcherValue => {
      if (unref(routeQueryVariable)) {
        return {
          value: unref(routeQueryVariable),
          source: 'route'
        }
      }
      if (unref(localStorageVariable)) {
        return {
          value: unref(localStorageVariable),
          source: 'storage'
        }
      }
      return {
        value: options.defaultValue,
        source: 'default'
      }
    },
    (val) => {
      if (['route', 'default'].includes(val.source)) {
        localStorageVariable.value = val.value === options.defaultValue ? undefined : val.value
      }
      if (['storage', 'default'].includes(val.source)) {
        routeQueryVariable.value = val.value
      }
    },
    { immediate: true }
  )
  return routeQueryVariable
}

const localStorageKey = (options: RouteQueryPersistedOptions): string => {
  return ['oc-options', options.storagePrefix, options.name].filter(Boolean).join('_')
}
