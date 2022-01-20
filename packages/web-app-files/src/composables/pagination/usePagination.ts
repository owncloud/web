import { ref, computed, ComputedRef, unref } from '@vue/composition-api'
import { MaybeRef } from 'web-pkg/src/utils'
import { useRouteQueryPersisted } from '../router'
import { PaginationConstants } from './constants'

interface PaginationOptions<T> {
  page: MaybeRef<number>
  perPage?: MaybeRef<number>
  items: MaybeRef<Array<T>>
}

interface PaginationResult<T> {
  items: ComputedRef<Array<T>>
  total: ComputedRef<number>
  perPage: ComputedRef<number>
}

export function usePagination<T>(options: PaginationOptions<T>): PaginationResult<T> {
  const perPage = createPerPageRef(options)
  const page = ref(options.page)
  const total = computed(() => Math.ceil(unref(options.items).length / perPage.value) || 1)
  const items = computed(() => {
    if (!unref(perPage)) {
      return unref(options.items)
    }

    const start = (page.value - 1) * perPage.value
    const end = start + perPage.value

    return unref(unref(options.items)).slice(start, end)
  })

  return {
    items,
    total,
    perPage
  }
}

function createPerPageRef<T>(options: PaginationOptions<TextDecodeOptions>): ComputedRef<number> {
  if (options.perPage) {
    return computed(() => unref(options.perPage))
  }

  const perPageQuery = useRouteQueryPersisted({
    name: PaginationConstants.perPageQueryName,
    defaultValue: PaginationConstants.perPageDefault
  })
  return computed(() => parseInt(String(perPageQuery.value)))
}
