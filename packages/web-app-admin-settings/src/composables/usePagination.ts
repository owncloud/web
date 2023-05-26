import { computed, Ref, unref } from 'vue'
import { queryItemAsString, useRouteQuery, useRouteQueryPersisted } from 'web-pkg/src'

export const usePagination = ({
  items
}: {
  items: Ref<any[]>
}): {
  currentPage: Ref<number>
  itemsPerPage: Ref<number>
  paginationPages: Ref<number>
  paginatedItems: Ref<any[]>
} => {
  const itemsPerPageQuery = useRouteQueryPersisted({
    name: 'admin-settings-items-per-page',
    defaultValue: '50'
  })
  const pageQuery = useRouteQuery('page', '1')

  const currentPage = computed(() => {
    return parseInt(queryItemAsString(unref(pageQuery)))
  })

  const itemsPerPage = computed(() => {
    return parseInt(queryItemAsString(unref(itemsPerPageQuery)))
  })

  const paginationPages = computed(() => {
    return Math.ceil(unref(items).length / unref(itemsPerPage))
  })

  const paginatedItems = computed(() => {
    const startIndex = (unref(currentPage) - 1) * unref(itemsPerPage)
    const endIndex = startIndex + unref(itemsPerPage)
    return unref(items).slice(startIndex, endIndex)
  })

  return {
    currentPage,
    itemsPerPage,
    paginatedItems,
    paginationPages
  }
}
