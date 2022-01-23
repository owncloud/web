import { ref, computed, ComputedRef, unref } from '@vue/composition-api'
import { MaybeRef } from 'web-pkg/src/utils'
import { useRouteQueryPersisted } from 'web-pkg/src/composables'
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
  const perPage = createPerPageRef<T>(options)
  const page = ref(options.page)
  const total = computed(() => Math.ceil(unref(options.items).length / unref(perPage)) || 1)
  const items = computed(() => {
    if (!unref(perPage)) {
      return unref(options.items)
    }

    const start = (unref(page) - 1) * unref(perPage)
    const end = start + unref(perPage)

    return unref(options.items).slice(start, end)
  })

  return {
    items,
    total,
    perPage
  }
}

function createPerPageRef<T>(options: PaginationOptions<T>): ComputedRef<number> {
  if (options.perPage) {
    return computed(() => unref(options.perPage))
  }

  const perPageQuery = useRouteQueryPersisted({
    name: PaginationConstants.perPageQueryName,
    defaultValue: PaginationConstants.perPageDefault
  })
  return computed(() => parseInt(String(unref(perPageQuery))))
}
