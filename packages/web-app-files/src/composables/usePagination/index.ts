import { ref, computed, ComputedRef, unref } from '@vue/composition-api'
import { MaybeRef } from '../utils'

interface PaginationOptions<T> {
  page: MaybeRef<number>
  perPage: MaybeRef<number>
  items: MaybeRef<Array<T>>
}

interface PaginationResult<T> {
  items: ComputedRef<Array<T>>
  total: ComputedRef<number>
}

export function usePagination<T>(options: PaginationOptions<T>): PaginationResult<T> {
  const page = ref(options.page)
  const perPage = ref(options.perPage)
  const total = computed(() => Math.ceil(unref(options.items).length / perPage.value) || 1)
  const items = computed(() => {
    if (!unref(perPage)) {
      return unref(options.items)
    }

    const start = (page.value - 1) * perPage.value
    const end = start + perPage.value

    return unref(options.items).slice(start, end)
  })

  return {
    items,
    total
  }
}
